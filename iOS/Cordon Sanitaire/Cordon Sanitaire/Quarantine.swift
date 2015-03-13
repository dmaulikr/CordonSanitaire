//
//  Quarantine.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit

class Quarantine: NSObject {
    
    var quarantinePlayers = [Player]()
    var center:CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 0, longitude: 0)
    
    init(players: Player...){
        
    }
    
    // when a player joins the quarantine, add them to the quarantine players
    func addPlayer(player:Player){
        
    }
    
    // when a player releases the quarantine, remove them from the quarantine players
    func removePlayer(player:Player){
        
    }
    
    // ask for the top left coordinate and the bottom right coordinate
    // of the map space containing the quarantine (useful for zooming into the quarantine)
    func getBoundaryCoordinates() -> CLLocationCoordinate2D {   //origin:CLLocationCoordinate2D, size:CLLocationCoordinate2D {
        var loc:CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 0, longitude: 0)
        return loc
    }
    
    // ask for the total area of the quarantine (in sq. miles, Made in USA :)
    func getTotalAreaOfQuarantine() -> Int {
        var area = 0
        
        // find area of polygon here
        
        return area
    }
    
    // ask for the center of the quarantine, this will be used to generate
    // the pathing order, i.e. the axis with which to rotate around
    func getCenterOfQuarantine() -> CLLocationCoordinate2D {
        var loc:CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 0, longitude: 0)
        return loc
    }
    
    // order the quarantine players based on rotation around the center
    func updateQuarantineOrder() {
        
    }
}
