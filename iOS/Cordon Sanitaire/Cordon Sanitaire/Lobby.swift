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
        
        self.getNewGame()
    }
    
    func getNewGame(){
        // get the start time from parse
        var startTime = Game.getStartTime()
        
        // query pubnub time and set up the countdown timer
        PubNub.requestServerTimeTokenWithCompletionBlock({(timetoken: NSNumber!, error: PNError!) -> Void in
            // if successfully got the time
            if (error == nil) {
                var currentTime = Double(timetoken)/1e7 // convert timetokento seconds from the epoch
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
    
    // Add a player to the lobby
    func addPlayer(player: Player){
        self.players[player.username] = player // add player to the model
        Game.singleton.viewController.addPlayerToMapFromLobby(player.getCoords(), playerID: player.id, state: player.state)
        self.viewController.update() // update the view to show the added player
        
        NSLog("Player \(player) was added to the lobby")
        NSLog("The Players in the lobby are: " + self.players.keys.array.description)
    }
    
    // Add an array of players to the lobby #not in use
    func addPlayers(newPlayers: [Player!]){
        for player in newPlayers {
            self.addPlayer(player)
        }
        self.viewController.update()
        NSLog("Players \(newPlayers) were added to the lobby")
        NSLog("The Players in the lobby are: " + self.players.keys.array.description)
    }
    
    func emptyLobby(){
        self.players = [:]
    }
    
    func startGame(){
        Game.singleton.start(self.players.values.array)
        Game.singleton.delegate?.startGame()
    }
    
    func startGameAfter(seconds: Double){
        Game.singleton.startAfter(seconds, players_usernames: self.players.keys.array)
        Game.singleton.delegate?.startGame()
    }
    

}

