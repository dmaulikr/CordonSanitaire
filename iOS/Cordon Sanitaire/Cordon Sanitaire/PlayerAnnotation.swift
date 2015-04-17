//
//  PlayerAnnotation.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 4/8/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import MapKit

class PlayerAnnotation: NSObject, MKAnnotation {
    var state: State
    var coordinate: CLLocationCoordinate2D

    init(state: State, coordinate: CLLocationCoordinate2D){
        self.state = state
        self.coordinate = coordinate
    }
    
    func changeState(state: State){
        self.state = state
    }
}
