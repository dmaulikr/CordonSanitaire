    //
//  Message.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 2/23/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation

let shoutHeader = "shout"
let addToQuarantineHeader = "addToQuarantine"
let removeFromQuarantineHeader = "removeFromQuarantine"

class Action {
    let header : String
    let id : Int
    init(action: String){
        var components = action.componentsSeparatedByString(" ")
        if components.count != 2 {
            println("Malformed action")
        }
        self.header = components[0]
        self.id = components[1].toInt()!
        
    }
    class func shout(fromId: Int){
        PubNub.sendMessage(shoutHeader + " " + fromId.description, toChannel: Client.current.global_channel)
    }
    
    class func addToQuaratine(fromId: Int){
        PubNub.sendMessage(addToQuarantineHeader + " " + fromId.description, toChannel: Client.current.global_channel)
    }
    
    class func removeFromQuaratine(fromId: Int){
        PubNub.sendMessage(removeFromQuarantineHeader + " " + fromId.description, toChannel: Client.current.global_channel)
    }
}


