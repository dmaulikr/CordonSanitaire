//
//  Lobby.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation

private let _SingletonSharedInstance = Lobby()

class Lobby: NSObject{
    class var singleton: Lobby! {
        return _SingletonSharedInstance
    }
    
    var players: [String!] = [];
    var countdown_timer = NSTimer();
    
    override init(){
        super.init()
        
        // get the start time from parse
        var startTime = scheduledStartTime

        // query pubnub time and set up the countdown timer
        PubNub.requestServerTimeTokenWithCompletionBlock({(timetoken: NSNumber!, error: PNError!) -> Void in
            // if successfully got the time
            if (error == nil) {
                var currentTime = Double(timetoken)/1e7 // convert timetoken to seconds from the epoch
                var startTimeToken = startTime.timeIntervalSince1970 // convert start time to seconds from the epoch
                var secondsUntilStart = startTimeToken - currentTime
                
                if (secondsUntilStart > 0){
                    NSLog("Game is going to start in " + secondsUntilStart.description + " seconds")
                    self.countdown_timer = NSTimer.scheduledTimerWithTimeInterval(secondsUntilStart, target: self, selector: Selector("startGame"), userInfo: nil, repeats: false)
                } else if (abs(secondsUntilStart) < Game.duration){
                    NSLog("Game in progress")
                    self.startGameAfter(abs(secondsUntilStart))
                }
                else {
                    NSLog("Game is already over :(")
                }

            } else {
                NSLog("Problem getting the PubNub time")
            }
        })
    }
    
    func addPlayer(player: String){
        self.players.append(player)
        NSLog("Player \(player) was added to the lobby")
        NSLog("The Players in the lobby are: " + self.players.description)
    }
    
    func addPlayers(newPlayers: [String!]){
        self.players.extend(newPlayers)
        NSLog("Players \(newPlayers) were added to the lobby")
        NSLog("The Players in the lobby are: " + self.players.description)
    }
    
    func emptyLobby(){
        self.players = []
    }
    
    func startGame(){
        var game = Game()
        game.start(0)
    }
    
    func startGameAfter(seconds: Double){
        var game = Game()
        game.start(seconds)
    }
    

}

