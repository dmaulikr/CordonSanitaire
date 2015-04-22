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
}

class Player {
    let id: String
    var state = State.Passive
    var latitude: CLLocationDegrees
    var longitude: CLLocationDegrees
    
    init(id: String, latitude: CLLocationDegrees, longitude: CLLocationDegrees){
        self.id = id
        self.latitude = latitude
        self.longitude = longitude
    }
    
    func changeState(newState: State){
        self.state = newState;
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
}

