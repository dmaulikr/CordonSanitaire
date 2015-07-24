//
//  Player.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation
import MapKit

enum State : String, RawRepresentable {
    case Passive = "Passive"
    case Active = "Active"
    case Trapped = "Trapped"
    case OnLobby = "OnLobby"
}

class Player:NSObject {
    let id: String
    let username: String
    var state: State
    var latitude: CLLocationDegrees
    var longitude: CLLocationDegrees
    
    init(id: String, username: String, latitude: CLLocationDegrees, longitude: CLLocationDegrees, state: State){
        self.id = id
        self.username = username
        self.latitude = latitude
        self.longitude = longitude
        self.state = state
    }
    
    // changes the state of a player and updates Parse about the change
    func changeState(newState: State){
        self.state = newState;
        
        // update our current state in the user table
        var query = PFQuery(className: "SimpleUser")
        query.whereKey("gkId", equalTo: self.id)
        query.getFirstObjectInBackgroundWithBlock({(obj: PFObject!, error: NSError!) -> Void in
            if (error == nil){
                obj.setValue(newState.rawValue, forKey: "state")
                obj.saveInBackgroundWithBlock({(success: Bool, error: NSError!) -> Void in
                    if(!success) {
                        NSLog("Failed to update user state on Parse")
                    }
                })
            }
        })
        
        // TODO: add this action to the Actions table in parse
        
    }
    
    func getCoords() -> CLLocationCoordinate2D {
        return CLLocationCoordinate2D(latitude: self.latitude, longitude: self.longitude)
    }
    
    func isTrapped() -> Bool {
        return self.state == State.Trapped
    }
    
    func isActive() -> Bool {
        return self.state == State.Active
    }
    
    func isPassive() -> Bool {
        return self.state == State.Passive
    }
    
    override var description: String {
        return username
    }
    
}

