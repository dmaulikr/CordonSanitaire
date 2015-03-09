//
//  Game.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation
import MapKit

class Game: NSObject{
    var players: [String: Player] = [:];
    // TODO: Add map to the game
    var timer = NSTimer()
    class var duration: Double {return 45.0} // Default duration of a game
    var start_time: NSDate?
    
    // Start the game
    // seconds -> how many seconds in the game we are in
    func start(seconds: Double){
        NSLog("Game is going to start")
        // TODO: get players from parse
        // TODO: change view to game view
        self.timer = NSTimer.scheduledTimerWithTimeInterval(0.1, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        self.start_time = NSDate().dateByAddingTimeInterval(-seconds)
    }
    
    func updateTimer(){
        var elapsed_time = Double(NSDate().timeIntervalSinceDate(start_time!))
        if (elapsed_time > Game.duration) {
            timer.invalidate()
            NSLog("Time is up!")
        } else {
            NSLog("Timer: \(Game.duration - elapsed_time)")
        }
    }
    
    private func getPlayers(players_ids: [String]){
        var userQuery = PFUser.query()
        userQuery.whereKey("objectId", containedIn: players_ids)
        var objects = userQuery.findObjects()
        for obj in objects {
            var player = Player(id: obj.objectId, pos: (obj.x, obj.y))
            players[player.id] = player
        }
    }
    
    // Get start game start time from Parse
    class func getStartTime() -> NSDate{
        var query = PFQuery(className: "Game")
        var game = query.getFirstObject()
        var startTime: AnyObject? = game.valueForKey("startTime")
        NSLog("Game time is " + startTime!.description)
        return startTime as NSDate
    }
    
}