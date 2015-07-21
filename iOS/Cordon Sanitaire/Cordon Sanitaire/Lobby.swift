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
    
    var players: [String:Player!] = [:];
    var countdown_timer = NSTimer();
    var viewController: LobbyViewController!
    
    override init(){
        super.init()
        // creates a view controller for the Lobby
        self.viewController = LobbyViewController()
        self.viewController.initTableView()
        
        Game.getStartTime()
    }
    
    func setTimerUntilGameStart(startTime: NSDate){
        // query pubnub time and set up the countdown timer
        PubNub.requestServerTimeTokenWithCompletionBlock({(timetoken: NSNumber!, error: PNError!) -> Void in
            // if successfully got the time
            if (error == nil) {
                var currentTime = Double(timetoken)/1e7 // convert timetokento seconds from the epoch
                var startTimeToken = startTime.timeIntervalSince1970 // convert start time to seconds from the epoch
                var secondsUntilStart = startTimeToken - currentTime
                if (secondsUntilStart > 0){
                    NSLog("GAME INFO: Game is going to start in " + secondsUntilStart.description + " seconds")
                    self.countdown_timer = NSTimer.scheduledTimerWithTimeInterval(secondsUntilStart, target: self, selector: Selector("startGame"), userInfo: nil, repeats: false)
                } else if (abs(secondsUntilStart) < Game.duration){
                    NSLog("GAME INFO: Game in progress")
                    self.startGameAfter(abs(secondsUntilStart))
                }
                else {
                    NSLog("GAME INFO: Game is already over :(")
                }
                
            } else {
                NSLog("LOBBY: Problem getting the PubNub time")
            }
        })
    }
    
    // Add a player to the lobby
    func addPlayer(player: Player){
        self.players[player.username] = player // add players username to the list of players in the lobby
        Game.singleton.addPlayer(player) // add player to map
        self.viewController.update() // update the view to show the added player
        
        NSLog("LOBBY: Player \(player) was added to the lobby")
        NSLog("LOBBY: The Players in the lobby are: " + self.players.keys.array.description)
    }
    
    // Add an array of players to the lobby #not in use
    func addPlayers(newPlayers: [Player!]){
        for player in newPlayers {
            self.addPlayer(player)
        }
        self.viewController.update()
    }
    
    func emptyLobby(){
        self.players = [:]
    }
    
    func startGame(){
        Game.singleton.start()
        Game.singleton.delegate?.startGame()
    }
    
    func startGameAfter(seconds: Double){
        Game.singleton.startAfter(seconds, players_usernames: self.players.keys.array)
        Game.singleton.delegate?.startGame()
    }
    

}

