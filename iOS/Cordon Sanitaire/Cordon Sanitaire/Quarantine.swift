//
//  Quarantine.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import MapKit

class Quarantine: NSObject {
    
    var quarantinePlayers:[String: Player]
    var center:CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 0, longitude: 0)
    var sortedQuarantine:[String]
    
    init(players: Player...){
        self.quarantinePlayers = [:]
        self.sortedQuarantine = []
    }
    
    // when a player joins the quarantine, add them to the quarantine players
    func addPlayer(player:Player){
        self.quarantinePlayers[player.id] = player
//        self.update
        
    }
    
    // when a player releases the quarantine, remove them from the quarantine players
    func removePlayer(player:Player){
        self.quarantinePlayers.removeValueForKey(player.id)
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
        
        var loc:CLLocationCoordinate2D!
        
        var avgLat = 0.0
        var avgLon = 0.0
        
        for (playerID, player) in self.quarantinePlayers {
            avgLat += player.latitude
            avgLon += player.longitude
        }
        
        avgLat = avgLat/Double(quarantinePlayers.count)
        avgLon = avgLon/Double(quarantinePlayers.count)
        
        loc = CLLocationCoordinate2D(latitude: avgLat, longitude: avgLon)
        
        return loc
    }
    
    // ask if a point is inside of the quarantine
    // TODO: implement this function
    func pointInPolygon(point:CLLocationCoordinate2D, mapView:MKMapView) -> Bool {

//        let mapPoint:MKMapPoint! = MKMapPointForCoordinate(point)
//        let polygonView:MKPolygonView! = mapView.viewForOverlay //(MKPolygonView*)[mapView viewForOverlay:self];
//        let polygonViewPoint:CGPoint! = polygonView.pointForMapPoint(mapPoint)  //[polygonView pointForMapPoint:mapPoint];
//        
//        return CGPathContainsPoint(polygonView.path, nil, polygonViewPoint, NO)
 
        return false
    }

    
    // order the quarantine players based on rotation around the center
    func updateQuarantineOrder() {
        var player_ids = quarantinePlayers.keys.array
        var lastPlayer = player_ids.first!;
        sortedQuarantine.append(lastPlayer);
        
        for (var i = 0; i < quarantinePlayers.count - 1; i++) {
            var nextPlayer = getNextPlayerCounterClockwise(lastPlayer);
            sortedQuarantine.append(nextPlayer);
            lastPlayer = nextPlayer;
        }
        
        
    }
    
    private func getNextPlayerCounterClockwise (id: String) -> String {
        var min = 2 * M_PI; // max angle
        var index = 0;
        var player = quarantinePlayers[id]
        var center = getCenterOfQuarantine()
        var start_theta = atan((player!.latitude - center.latitude)/(player!.longitude - center.longitude));
        var next_player: Player?;
        
        for other_player in quarantinePlayers.values.array {
            if (other_player.id == player!.id){
                continue;
            }
            
            var next_theta = atan((other_player.latitude - center.latitude)/(other_player.longitude - center.longitude));
            var diff = next_theta - start_theta;
            
            if (diff < 0){
                diff += 2 * M_PI;
            }
            
            if (diff < min) {
                next_player = other_player
                min = diff;
            }
        }
        
        return next_player!.id;
    }
}
