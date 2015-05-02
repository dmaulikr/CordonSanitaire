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
    var myLocation: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude:51.5072, longitude:-0.1275)    // default the location to london (to avoid crash)
    var timer = NSTimer() // game timer
    class var duration: Double {return 45.0} // Default duration of a game.
    var start_time: NSDate? // The actual time the game started for the client
    var quarantine = Quarantine()
    
    var delegate:GameDelegate?
    var viewController = MapViewController()
    
    // Start the game
    // seconds      -> how many seconds in the game we are in
    // players_ids -> an array of the ids of the users in this game
    func startAfter(seconds: Double, players_usernames: [String]){
        NSLog("Game is going to start")
        
        getPlayersState(players_usernames)
        
        self.timer = NSTimer.scheduledTimerWithTimeInterval(0.1, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        self.start_time = NSDate().dateByAddingTimeInterval(-seconds)
        
        // notify the view controller of a started game
//        delegate?.startGame()
    }
    
    func start(players: [Player!]){
        NSLog("Game has started")
        self.startingPlayers(players)
        self.timer = NSTimer.scheduledTimerWithTimeInterval(0.1, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        self.start_time = NSDate()
    }
    
    // Updates the game timer
    func updateTimer(){
        var elapsed_time = Double(NSDate().timeIntervalSinceDate(start_time!))
        if (elapsed_time > Game.duration) {
            timer.invalidate()
            NSLog("Time is up!")
        } else {
//            NSLog("Timer: \(Game.duration - elapsed_time)")
        }
    }
    
    // Starts all the players in a Passive state
    private func startingPlayers(players: [Player!]){
        for player in players {
            player.changeState(State.Passive) // everyobody starts in a Passive State
            self.players[player.id] = player
            if (player.id == Client.singleton.id){
                self.myPlayer = player
                self.myLocation = player.getCoords()
            }
        }
    }
    
    // Queries PubNub for the players in the game channel group
    private func getPlayersState(players_usernames: [String]){
        var userQuery = PFQuery(className: "SimpleUser")
        userQuery.whereKey("username", containedIn: players_usernames)
        var objects = userQuery.findObjects()
        NSLog(players_usernames.description)
        for obj in objects {
            if(obj.valueForKey("latitude") != nil && obj.valueForKey("longitude") != nil) {
                var state = State(rawValue: obj.valueForKey("state") as! String) ?? State.Passive // if there's a state on Parse for this player assign it, if assign its state to be Passive
                var player = Player(id: obj.valueForKey("gkId") as! String, username: obj.valueForKey("username") as! String, latitude: obj.valueForKey("latitude") as! CLLocationDegrees, longitude: obj.valueForKey("longitude") as! CLLocationDegrees, state: state)
                self.players[player.id] = player
                
                if (player.id == Client.singleton.id){
                    self.myPlayer = player
                    self.myLocation = player.getCoords()
                }
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
        return startTime as! NSDate
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
        
        // ensure that the biggest dimension is accounted for in the window
        if( latSpan > lonSpan) {
            return MKCoordinateSpanMake(latSpan, latSpan)
        }
        else {
            return MKCoordinateSpanMake(lonSpan, lonSpan)
        }
    }
    
    func addPlayerToQuarantine(id: String){
        if (self.players[id] != nil) {
            self.players[id]?.changeState(State.Active)
            self.quarantine.addPlayer(self.players[id]!)
        }
        
        NSLog("Players in the quarantine: " + quarantine.quarantinePlayers.description)
        self.update()
    }
    
    func removePlayerFromQuarantine(id: String){
        if (self.players[id] != nil) {
            self.players[id]?.changeState(State.Passive)
            self.quarantine.removePlayer(self.players[id]!)
        }
        NSLog("Players in the quarantine: " + quarantine.quarantinePlayers.description)
        self.update()
    }
    
    func updateQuarantine(){
        quarantine.updateQuarantineOrder()
        self.viewController.updateQuarantine(quarantine.sortedQuarantineCoords)
    }
    
    func updatePlayers(){
        for id in self.players.keys {
            var player = self.players[id]!
            var point = CGPoint(x: player.latitude, y: player.longitude)
            if (quarantine.path.containsPoint(point) && self.players[id]!.isPassive()){
                self.players[id]!.changeState(State.Trapped)
                if (id == myPlayer.id) {
                    myPlayer.changeState(State.Trapped)
                    self.viewController.showShoutButton() // if my player got trapped, show the shout button in the view
                }
            } else if(player.isTrapped()) { // if player was trapped, but now is outside the quarantine, change its state to Passive
                player.changeState(State.Passive)
                if (id == myPlayer.id) {
                    myPlayer.changeState(State.Passive)
                    self.viewController.showJoinButton() // if my player got untrapped, show the join button in the view
                }
            }
        }
        self.viewController.updatePlayers()
    }
    
    func update(){
        self.updateQuarantine() // updates the quarantine
        self.updatePlayers() // updates the state of people: whether they are trapped or not
    }
    
}