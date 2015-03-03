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
//    var map;
    var timer = NSTimer()
    let game_time: Double = 45
    var start_time: NSDate?
    
    // Start the game
    func start(){
        
        // TODO: get players from parse
        // TODO: change view to game view
        timer = NSTimer.scheduledTimerWithTimeInterval(0.1, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        start_time = NSDate()
    }
    
    func updateTimer(){
        var elapsed_time = Double(NSDate().timeIntervalSinceDate(start_time!))
        if (elapsed_time > game_time) {
            timer.invalidate()
            NSLog("Time is up!")
        } else {
            NSLog("Timer: \(game_time - elapsed_time)")
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
    
}