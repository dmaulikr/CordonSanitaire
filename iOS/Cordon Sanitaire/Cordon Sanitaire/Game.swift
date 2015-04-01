//
//  Game.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation
import MapKit

private let _SingletonSharedInstance = Game()

protocol GameDelegate {
    func startGame()
}

// TODO: Add map to the game
class Game: NSObject{
    
    class var singleton:Game! {
        return _SingletonSharedInstance
    }

    var players: [String: Player] = [:]; // Map of id -> players
    var myPlayer: Player!
    var myLocation: CLLocationCoordinate2D!
    var timer = NSTimer() // game timer
    class var duration: Double {return 45.0} // Default duration of a game.
    var start_time: NSDate? // The actual time the game started for the client
    var quarantine = Quarantine()
    
    var delegate:GameDelegate?
    
    // Start the game
    // seconds      -> how many seconds in the game we are in
    // players_ids -> an array of the ids of the users in this game
    func start(seconds: Double, players_ids: [String!]){
        NSLog("Game is going to start")
        
        getPlayers(players_ids)
        
        self.timer = NSTimer.scheduledTimerWithTimeInterval(0.1, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        self.start_time = NSDate().dateByAddingTimeInterval(-seconds)
        
        // notify the view controller of a started game
        delegate?.startGame()
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
            if(obj.valueForKey("latitude") != nil && obj.valueForKey("longitude") != nil) {
                var player = Player(id: obj.objectId, latitude: obj.valueForKey("latitude") as CLLocationDegrees, longitude: obj.valueForKey("longitude") as CLLocationDegrees)
                players[player.id] = player
            }
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
    
    // Get center of players in the game
    // NOTE: not sure if this is useful
    func getCenterOfPlayerDistributedGameMap() -> CLLocationCoordinate2D {
        
        var latSum:CLLocationDegrees = 0.0
        var lonSum:CLLocationDegrees = 0.0
        
        for playerID:String in players.keys {
            
            let lat = Game.singleton.players[playerID]?.latitude
            let lon = Game.singleton.players[playerID]?.longitude
            
            latSum = latSum + lat!
            lonSum = lonSum + lon!
        }
        
        let latAvg = latSum / Double(players.count)
        let lonAvg = lonSum / Double(players.count)
        
        return CLLocationCoordinate2D(latitude: latAvg, longitude: lonAvg)
    }
    
    
    // Get center of the game map
    func getCenterOfGameMap() -> CLLocationCoordinate2D {
        
        let bounds = getBoundingCoordsOfGameMap()
        
        let centerLat = Double(bounds.topLeft.latitude + bounds.bottomRight.latitude) / 2.0
        let centerLon = Double(bounds.bottomRight.longitude + bounds.topLeft.longitude) / 2.0
        
        return CLLocationCoordinate2D(latitude: centerLat, longitude: centerLon)
    }

    
    // get the bounds of the game map
    func getBoundingCoordsOfGameMap() -> (topLeft:CLLocationCoordinate2D, bottomRight:CLLocationCoordinate2D) {
        
        var minLat:CLLocationDegrees = 180.0
        var minLon:CLLocationDegrees = 180.0
        var maxLat:CLLocationDegrees = -180.0
        var maxLon:CLLocationDegrees = -180.0
        
        for playerID:String in players.keys {
            
            let lat = Game.singleton.players[playerID]?.latitude
            let lon = Game.singleton.players[playerID]?.longitude
            
            if( lat < minLat ) {
                minLat = lat!
            }
            if( lat > maxLat ) {
                maxLat = lat!
            }
            if( lon < minLon ) {
                minLon = lon!
            }
            if( lon > maxLon ) {
                maxLon = lon!
            }
        }

        let topLeft = CLLocationCoordinate2D(latitude: maxLat, longitude: minLon)
        let bottomRight = CLLocationCoordinate2D(latitude: minLat, longitude: maxLon)
        
        return (topLeft, bottomRight)
    }
    
    
    // returns the angle at which the map should zoom out
    func getAngleForSpanOfGameMap() -> CLLocationDegrees {
        
        let center = getCenterOfGameMap()
        let bounds = getBoundingCoordsOfGameMap()
        
        let latSpan = abs(bounds.topLeft.latitude - center.latitude)
        let lonSpan = abs(bounds.topLeft.longitude - center.longitude)
        
        if( latSpan > lonSpan) {
            return latSpan
        }
        else {
            return lonSpan
        }
    }
    
    
    // returns the width at which the map should zoom out
    func getWidthAndHeightOfGameMap() -> MKCoordinateSpan {
        
        let center = getCenterOfGameMap()
        let bounds = getBoundingCoordsOfGameMap()
        
        let latSpan = abs(bounds.topLeft.latitude - center.latitude) + 0.1  // padding
        let lonSpan = abs(bounds.topLeft.longitude - center.longitude) + 0.1 // padding
        
        return MKCoordinateSpanMake(lonSpan, latSpan)
    }
    
}