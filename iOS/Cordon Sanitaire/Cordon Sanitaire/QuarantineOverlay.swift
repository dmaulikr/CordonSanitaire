//
//  QuarantineOverlay.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/16/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import MapKit

class QuarantineOverlay: NSObject, MKOverlay {
    
    var coordinate : CLLocationCoordinate2D {
        
        get {
            let pt = MKMapPointMake(
                MKMapRectGetMidX(self.boundingMapRect),
                MKMapRectGetMidY(self.boundingMapRect))
            return MKCoordinateForMapPoint(pt)
        }
    }
    
    private let realBoundingMapRect : MKMapRect
    var boundingMapRect : MKMapRect {
        get {
            return realBoundingMapRect
        }
    }
    
    init(rect:MKMapRect) {
        self.realBoundingMapRect = rect
        super.init()
    }
   
}
