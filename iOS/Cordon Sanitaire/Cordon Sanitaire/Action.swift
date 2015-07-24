    //
//  Message.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 2/23/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation

    
enum Header : String, RawRepresentable{
    case Shout = "Shout"
    case Join = "Join"
    case Release = "Release"
    case SubscribeToChannel = "SubscribeToChannel"
    case AddGame = "AddGame"
    case AddToLobby = "AddToLobby"
    case MalFormattedMessage = "MalFormattedMessage"
}

class Action {
    let header : Header
    let id : String? // used for shout, join, release and addToLobby messages
    let username: String? // used for addToLobby messages
    let channel: String? // used for subscrineToChannel messages
    let lat: CLLocationDegrees? // used for addToLobby messages
    let lon: CLLocationDegrees? // used for addToLobby messages

    init(header: Header, id: String?, username: String?, channel: String?, latitude: CLLocationDegrees?, longitude: CLLocationDegrees?){
        self.id = id
        self.username = username
        self.channel = channel
        self.header = header
        self.lat = latitude
        self.lon = longitude
    }
  
    class func shout(fromId: String){
        PubNub.sendMessage(
            [
                "action": Header.Shout.rawValue,
                "id": fromId
            ],
            toChannel: Client.singleton.group_channel)
        
        var parseShoutUpdate = PFObject(className: "Actions")
        parseShoutUpdate["type"] = "Shout"
        parseShoutUpdate["user"] = fromId
        parseShoutUpdate.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
                if(!success){
                    NSLog("failed to update")
                }
            })
    }
    
    class func join(fromId: String){
        PubNub.sendMessage(
            [
                "action": Header.Join.rawValue,
                "id": fromId
            ],
            toChannel: Client.singleton.group_channel)
        var parseJoinUpdate = PFObject(className: "Actions")
        parseJoinUpdate["type"] = "Join"
        parseJoinUpdate["user"] = fromId
        parseJoinUpdate.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
            if(!success){
                NSLog("failed to update")
            }
        })
    }
    
    class func release(fromId: String){
        PubNub.sendMessage(
            [
                "action": Header.Release.rawValue,
                "id": fromId
            ],
                toChannel: Client.singleton.group_channel)
        var parseReleaseUpdate = PFObject(className: "Actions")
        parseReleaseUpdate["type"] = "Release"
        parseReleaseUpdate["user"] = fromId
        parseReleaseUpdate.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
            if(!success){
                NSLog("failed to update")
            }
        })
    }
    
    class func addToLobby(id: String, username: String, location: CLLocationCoordinate2D){
        PubNub.sendMessage(
            [
                "action": Header.AddToLobby.rawValue,
                "id": id,
                "username": username,
                "latitude": location.latitude,
                "longitude": location.longitude
            ],
                toChannel: Client.singleton.group_channel)
    }
    
    class func parseMessage(message: PNMessage) -> Action{
        var header: Header;
        var id: String?
        var username: String?
        var channel: String?
        var lat: CLLocationDegrees?
        var lon: CLLocationDegrees?
        var action: Action
        
        if (message.message is NSDictionary){
            header = Header(rawValue: message.message["action"] as! String) ?? Header.MalFormattedMessage
            id = message.message["id"] as! String?
            username = message.message["username"] as! String?
            lat = message.message["latitude"] as! CLLocationDegrees?
            lon = message.message["longitude"] as! CLLocationDegrees?
            channel = message.message["channel"] as! String?
        }
        else {
            header = Header.MalFormattedMessage
        }
        
        return Action(header: header, id: id, username: username, channel: channel, latitude: lat, longitude: lon)
    }
    
     class func getHeader(message: String) -> Header {
        var components = message.componentsSeparatedByString(" ")
        var header = Header(rawValue: components[0]) ?? Header.MalFormattedMessage

        return header
    }
}



    