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
    var pos: (Double, Double)
    
    init(id: String, pos: (Double, Double)){
        self.id = id
        self.pos = pos
    }
    
    func changeState(newState: State){
        self.state = newState;
    }
}

