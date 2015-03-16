//
//  Player.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation
import MapKit

enum State {
    case Passive
    case Active
    case Trapped
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
}

