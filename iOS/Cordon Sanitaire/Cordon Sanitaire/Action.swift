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
        PubNub.sendMessage(Header.Shout.rawValue + " " + fromId, toChannel: Client.singleton.group_channel)
    }
    
    class func join(fromId: String){
        PubNub.sendMessage(Header.Join.rawValue + " " + fromId, toChannel: Client.singleton.group_channel)
    }
    
    class func release(fromId: String){
        PubNub.sendMessage(Header.Release.rawValue + " " + fromId, toChannel: Client.singleton.group_channel)
    }
    
    class func addToLobby(id: String, username: String, location: CLLocationCoordinate2D){
        PubNub.sendMessage(Header.AddToLobby.rawValue + " "
            + id + " "
            + username + " "
            + location.latitude.description + " "
            + location.longitude.description, toChannel: Client.singleton.group_channel)
    }
    
    class func parseMessage(message: String) -> Action{
        var header: Header;
        var id: String?
        var username: String?
        var channel: String?
        var lat: CLLocationDegrees?
        var lon: CLLocationDegrees?
        var components = message.componentsSeparatedByString(" ")
        var action: Action
        
        header = Action.getHeader(message)
        switch header {
        case Header.Shout, Header.Join, Header.Release:
            id = components[1]
            break
        case Header.AddToLobby:
            id = components[1]
            username = components[2]
            lat = NSString(string: components[3]).doubleValue
            lon = NSString(string: components[4]).doubleValue
            break
        case Header.AddGame:
            // AddGame only send the header
            break
        case Header.SubscribeToChannel:
            channel = components[1]
        default:
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


