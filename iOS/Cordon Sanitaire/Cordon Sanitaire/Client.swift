//
//  Client.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 2/23/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

class Client: NSObject, PNDelegate {
    
    let global_channel = PNChannel.channelWithName("development", shouldObservePresence: false) as PNChannel // Global channel
    var private_channel: PNChannel!
    var group_channel: PNChannel!

    let config = PNConfiguration(forOrigin: "pubsub.pubnub.com",
        publishKey: "pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884",
        subscribeKey: "sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe",
        secretKey: "sec-c-MTMwNmJiYTYtM2JhMC00NTQ5lThmM2UtNjhmNjJiYmJkNjlm")
    
    let delegate:PNDelegate!
    
    var id: String?
    
    class var current :Client! {
        return _SingletonSharedInstance
    }
    
    override init(){
        super.init()
        self.delegate = self

        PubNub.setDelegate(self.delegate)
        PubNub.setConfiguration(self.config)
        PubNub.connect()
        
        PNLogger.loggerEnabled(false) // disables PubNub logger -- too verbose
        PubNub.subscribeOn([self.global_channel])
    }
    
    // Sets the ID of a client, also sets its private channel according to the ID
    func setId(id: String){
        self.id = id
        PubNub.setClientIdentifier(PFUser.currentUser().username)
        self.private_channel = PNChannel.channelWithName(id, shouldObservePresence: false) as PNChannel
        PubNub.subscribeOn([self.private_channel])
    }
    
    func setGroupChannel(channel_name: String){
        self.group_channel = PNChannel.channelWithName(channel_name, shouldObservePresence: true) as PNChannel
    }

    func pubnubClient(client: PubNub!, didConnectToOrigin origin: String!) {
        println("DELEGATE: Connected to " + origin)
    }
    
    func pubnubClient(client: PubNub!, didReceivePresenceEvent event: PNPresenceEvent!) {
        switch event.type.rawValue {
        case PNPresenceEventType.Join.rawValue:
            // should add event.client.identifier to list of usernames in the waiting area
            println("user " + event.client.identifier + "joined channel " + event.channel.name)
        default:
            println("defaulted")
        }
    }
    
    func pubnubClient(client: PubNub!, didSubscribeOn channelObjects: [AnyObject]!) {
        println("Subscribed on " + channelObjects.description)
    }

    func pubnubClient(client: PubNub!, didReceiveMessage message: PNMessage!) {
        var action = Action(action: message.message as String)
        switch action.header {
        case shoutHeader:
            println("Received " + action.header + " from " + action.id.description)
        case addToQuarantineHeader:
            println(action.id.description + " " + action.header)
        case removeFromQuarantineHeader:
            println(action.id.description + " " + action.header)
        default:
            println("Unknown action")
        }
    }
}

private let _SingletonSharedInstance = Client()
