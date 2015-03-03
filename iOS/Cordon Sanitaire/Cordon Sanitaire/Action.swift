    //
//  Message.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 2/23/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation

    
enum Headers : String, RawRepresentable{
    case Shout = "Shout"
    case AddToQuarantine = "AddToQuaratine"
    case RemoveFromQuarantine = "RemoveFromQuarantine"
    case MalFormattedMessage = "MalFormattedMessage"
}

class Action {
    let header : Headers
    let id : String
    init(id: String, header: Headers){
        self.id = id
        self.header = header
    }
    class func shout(fromId: String){
        PubNub.sendMessage(Headers.Shout.rawValue + " " + fromId, toChannel: Client.current.global_channel)
    }
    
    class func addToQuaratine(fromId: String){
        PubNub.sendMessage(Headers.AddToQuarantine.rawValue + " " + fromId, toChannel: Client.current.global_channel)
    }
    
    class func removeFromQuaratine(fromId: String){
        PubNub.sendMessage(Headers.RemoveFromQuarantine.rawValue + " " + fromId, toChannel: Client.current.global_channel)
    }
    
    class func parseMessage(message: String) -> Action{
        var header: Headers;
        var id: String;
        var components = message.componentsSeparatedByString(" ")
        if components.count != 2 {
            header = Headers.MalFormattedMessage
            id = ""
        } else {
            header = Headers(rawValue: components[0])!
            id = components[1]
        }
        return Action(id: id, header: header)
    }
}


