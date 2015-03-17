//
//  Game.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation
import MapKit

// TODO: Add map to the game
class Game: NSObject{

    var players: [String: Player] = [:]; // Map of id -> players
    var timer = NSTimer() // game timer
    class var duration: Double {return 45.0} // Default duration of a game.
    var start_time: NSDate? // The actual time the game started for the client
    var quarantine = Quarantine()
    
    // Start the game
    // seconds      -> how many seconds in the game we are in
    // players_ids -> an array of the ids of the users in this game
    // TODO: change view to game view
    func start(seconds: Double, players_ids: [String!]){
        NSLog("Game is going to start")
        
        getPlayers(players_ids)
        
        self.timer = NSTimer.scheduledTimerWithTimeInterval(0.1, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        self.start_time = NSDate().dateByAddingTimeInterval(-seconds)
    }
    
    // Updates the game timer
    func updateTimer(){
        var elapsed_time = Double(NSDate().timeIntervalSinceDate(start_time!))
        if (elapsed_time > Game.duration) {
            timer.invalidate()
            NSLog("Time is up!")
        } else {
            NSLog("Timer: \(Game.duration - elapsed_time)")
        }
    }
    
    // Queries PubNub for the players in the game channel group
    private func getPlayers(players_ids: [String!]){
        var userQuery = PFUser.query()
        userQuery.whereKey("objectId", containedIn: players_ids)
        var objects = userQuery.findObjects()
        for obj in objects {
            NSLog(obj.description)
            var player = Player(id: obj.objectId, latitude: obj.valueForKey("latitude") as CLLocationDegrees, longitude: obj.valueForKey("longitude") as CLLocationDegrees)
            players[player.id] = player
        }
        
        NSLog("The players in this game are: " + players.description)
    }
    
    // Get start game start time from Parse
    class func getStartTime() -> NSDate{
        var query = PFQuery(className: "Game")
        query.orderByDescending("startTime")
        var game = query.getFirstObject()
        var startTime: AnyObject? = game.valueForKey("startTime")
        NSLog("Game time is " + startTime!.description)
        return startTime as NSDate
    }
    
}