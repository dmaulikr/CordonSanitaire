//
//  Client.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 2/23/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import CoreLocation
import MapKit
import GameKit

class Client: NSObject, PNDelegate, CLLocationManagerDelegate {
    
    let global_channel = PNChannel.channelWithName("ios_development", shouldObservePresence: false) as! PNChannel // Global channel
    var private_channel: PNChannel!
    var group_channel: PNChannel!

    let config = PNConfiguration(forOrigin: "pubsub.pubnub.com",
        publishKey: "pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884",
        subscribeKey: "sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe",
        secretKey: "sec-c-MTMwNmJiYTYtM2JhMC00NTQ5lThmM2UtNjhmNjJiYmJkNjlm")
    
    let delegate:PNDelegate!
    let location_manager = CLLocationManager()
    
    
    var id: String?
    var username: String?
    
    class var singleton :Client! {
        return _SingletonSharedInstance
    }
    
    override init(){
        self.delegate = nil
        super.init()
        
        PubNub.setDelegate(self.delegate)
        PubNub.setConfiguration(self.config)
        PubNub.connect()
        
        PNLogger.loggerEnabled(false) // disables PubNub logger -- too verbose
        PubNub.subscribeOn([self.global_channel])
    }
    
    // "logs in" the client with the information from Game Center
    // sets the private channel according to the Game Center Id
    func login(gkPlayer: GKLocalPlayer!){
        self.username = gkPlayer.alias         // set Client username to be the Game Center alias
        self.id = gkPlayer.playerID            // sets Client Id to be the Game Center Id
        PubNub.setClientIdentifier(self.id)    // sets the Client's PubNub Id to be the GameCenter Id
        NSLog(self.id!)
        
        // creates and subscribes to a private channel
        self.private_channel = PNChannel.channelWithName(self.username, shouldObservePresence: false) as! PNChannel
        NSLog(self.private_channel.description)
        PubNub.subscribeOn([self.private_channel], withCompletionHandlingBlock: {(state: PNSubscriptionProcessState, object: [AnyObject]!, error: PNError!) -> Void in
            if (error == nil){
                self.tellCloudCodeAboutMe()
                NSLog(self.id!)
                NSLog("Successfuly subscribed to private channel")
            }
            else{
                NSLog("An error occured when subscribing to private channel: " + error.description)
            }
        })
        
        // search for logged user on Parse
        var query = PFQuery(className: "SimpleUser")
        query.whereKey("gkId", equalTo: self.id)
        
        query.getFirstObjectInBackgroundWithBlock({(user: PFObject!, error: NSError!) -> Void in

            // if a Parse SimpleUser does not exist, needs to create new SimpleUser on Parse
            if(user == nil){
                var myParseUser = PFObject(className: "SimpleUser")
                myParseUser["username"] = self.username
                myParseUser["present"] = true
                myParseUser["gkId"] = self.id
                myParseUser["role"] = "citizen"
                
                myParseUser.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
                    if (!success){
                        NSLog("Failed to create user on Parse")
                    }
                })
                
            } else { // if SimpleUser already exists, just updates username and presence status
                user["username"] = self.username
                user["present"] = true
                user.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
                    if (!success){
                        NSLog("Failed to update user on Parse")
                    }
                })
            }
        })
        
        // at last, get the geolocation of the player
        self.setLocation()
    }
    
    private func setLocation(){
        self.location_manager.delegate = self
        self.location_manager.requestAlwaysAuthorization()
        self.location_manager.desiredAccuracy = kCLLocationAccuracyBest
        
        self.location_manager.startUpdatingLocation()
    }
    
    func setGroupChannel(channel_name: String){
        if (self.group_channel != nil){
            PubNub.unsubscribeFrom([self.group_channel])
        }
        self.group_channel = PNChannel.channelWithName(channel_name, shouldObservePresence: true) as! PNChannel
        PubNub.subscribeOn([self.group_channel])
        PubNub.requestParticipantsListFor([self.group_channel])
//        Lobby.singleton.addPlayers(players as [String])
    }

    //////////////////////
    // PubNub delegates //
    //////////////////////
    
    func pubnubClient(client: PubNub!, didConnectToOrigin origin: String!) {
        NSLog("DELEGATE: Connected to " + origin)
    }
    
    
    func pubnubClient(client: PubNub!, didReceiveParticipants presenceInformation: PNHereNow!, forObjects channelObjects: [AnyObject]!){
        var clients = presenceInformation.participantsForChannel(self.group_channel) as! [PNClient]
        var players = clients.map({ ($0).identifier })
        Lobby.singleton.addPlayers(players)
        
    }
    
    func pubnubClient(client: PubNub!, didReceivePresenceEvent event: PNPresenceEvent!) {
        switch event.type.rawValue {
        case PNPresenceEventType.Join.rawValue:
            // should add event.client.identifier to list of usernames in the waiting area
            Lobby.singleton.addPlayer(event.client.identifier)
            NSLog("User " + event.client.identifier + "joined channel " + event.channel.name)
        default:
            NSLog("defaulted")
        }
    }
    
    func pubnubClient(client: PubNub!, didSubscribeOn channelObjects: [AnyObject]!) {
        NSLog("Subscribed on " + channelObjects.description)
    }

    func pubnubClient(client: PubNub!, didReceiveMessage message: PNMessage!) {
        var action = Action.parseMessage(message.message.description)
        switch action.header {
        case Headers.Shout:
            NSLog("Received " + action.header.rawValue + " from " + action.id)
            break
        case Headers.AddToQuarantine:
            NSLog(action.id + " " + action.header.rawValue)
            Game.singleton.addPlayerToQuarantine(action.id)
            break
        case Headers.RemoveFromQuarantine:
            NSLog(action.id + " " + action.header.rawValue)
            Game.singleton.removePlayerFromQuarantine(action.id)
            break
        case Headers.SubscribeToChannel:
            setGroupChannel(action.id)
            break
        default:
            NSLog("Header: " + action.header.rawValue + message.message.description)
        }
    }
    /////////////////////////////////////
    func tellCloudCodeAboutMe() {
        NSLog(self.username!)
        PFCloud.callFunctionInBackground("dummyKMeans", withParameters: ["id": self.username!] , block: {(result: AnyObject!, error: NSError!) -> Void in
            if (error == nil){
                NSLog("CLOUD CODE: successfully told Cloud Code about this user")
            } else {
                NSLog("CLOUD CODE: An error has occured")
            }
        })
    }
    
    func terminate(){
        PubNub.unsubscribeFrom([private_channel, group_channel, global_channel], withCompletionHandlingBlock: {(object: [AnyObject]!, error: PNError!) -> Void in
            if (error == nil){
                NSLog("Unsubscribed successfully")
            } else {
                NSLog("Failed to unsubscribe")
                NSLog(error.description)
            }
        })
    }
    
    /////////////////////////////////
    // CLLocationManager delegates //
    /////////////////////////////////
    
    func locationManager(manager: CLLocationManager!, didUpdateToLocation newLocation: CLLocation!, fromLocation oldLocation: CLLocation!) {
        NSLog("LOCATION: " + newLocation.description)
        // set my location to the current location
        Game.singleton.myLocation = newLocation.coordinate
        
        if (self.id != nil) {
            var query = PFQuery(className: "SimpleUser")
            query.whereKey("gkId", equalTo: self.id)
            var myParseUser = query.getFirstObject()
            
            if (myParseUser != nil){
                myParseUser.setValuesForKeysWithDictionary(["latitude": newLocation.coordinate.latitude, "longitude": newLocation.coordinate.longitude])
                myParseUser.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
                    if (!success){
                        NSLog("Failed to update user's location on Parse")
                    } else {
                        NSLog("Successfully updated user's location on Parse")
                        self.location_manager.stopUpdatingLocation()
                    }
                })
            }
        }
    }
    
    func locationManager(manager: CLLocationManager!, didFailWithError error: NSError!) {
        NSLog("LOCATION: " + error.description)
    }
    
}

private let _SingletonSharedInstance = Client()
