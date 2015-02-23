//
//  PubnubClient.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 2/23/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

let client =  Client()

class Client: NSObject, PNDelegate {
    let channel = PNChannel.channelWithName("development", shouldObservePresence: true) as PNChannel

    let config = PNConfiguration(forOrigin: "pubsub.pubnub.com",
        publishKey: "pub-c-f1d4a0b1-66e6-48ae-bd2b-72bcaac47884",
        subscribeKey: "sub-c-37e7ca9a-54e6-11e4-a7f8-02ee2ddab7fe",
        secretKey: "sec-c-MTMwNmJiYTYtM2JhMC00NTQ5lThmM2UtNjhmNjJiYmJkNjlm")
    
    let delegate:PNDelegate!

    override init(){
        super.init()
        self.delegate = self
        println("here")
        PubNub.setDelegate(self.delegate)
        PubNub.setConfiguration(self.config)
        PubNub.connect()
        
        PNLogger.loggerEnabled(false) // disables PubNub logger -- too verbose
        PubNub.subscribeOn([self.channel])

    }
    
    
    func pubnubClient(client: PubNub!, didConnectToOrigin origin: String!) {
        println("DELEGATE: Connected to " + origin)
    }
    
    func pubnubClient(client: PubNub!, didReceivePresenceEvent event: PNPresenceEvent!) {
        switch event.type.rawValue {
        case PNPresenceEventType.Join.rawValue:
            println("Joined " + event.channel.description)
        default:
            println("defaulted")
        }
    }
    
    func pubnubClient(client: PubNub!, didSubscribeOn channelObjects: [AnyObject]!) {
        println("Subscribed on " + channelObjects.description)

    }
    
    func pubnubClient(client: PubNub!, didReceiveMessage message: PNMessage!) {
        var action = Action(action: message.message.description)
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