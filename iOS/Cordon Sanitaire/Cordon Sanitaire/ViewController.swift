//
//  ViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 2/18/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import MapKit

class ViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate, PNDelegate {
        
    @IBOutlet var theButton: UIButton!
    @IBOutlet var timerTextView: UITextView!
    @IBOutlet var mapView: MKMapView!
    
    let locationManager = CLLocationManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
//        locationManager.delegate = self
//        // must request authorization to use location
//        locationManager.requestWhenInUseAuthorization()
//        
//        // will cause map to zoom nicely to user location
//        mapView.userTrackingMode = .Follow
        
        // sample pin location 
        // 42.3601° N, 71.0589°
        let location = CLLocationCoordinate2D(
            latitude: 42.3601,
            longitude: -71.0589
        )
        
        // start at a zoomed in location on the player
        let span = MKCoordinateSpanMake(0.005, 0.005)
        let region = MKCoordinateRegion(center: location, span: span)
        mapView.setRegion(region, animated: true)
        
        // place a pin to show that we can place annotations
        let annotation = MKPointAnnotation()
        annotation.setCoordinate(location)
        annotation.title = "Red Pin"
        annotation.subtitle = "coolest location on the map"
        mapView.addAnnotation(annotation)
        
        // settings for the map to hide most information and prevent interaction with the map
        mapView.showsPointsOfInterest = false
        mapView.showsBuildings = false
        mapView.showsUserLocation = true
        mapView.zoomEnabled = false
        mapView.scrollEnabled = false
        mapView.userInteractionEnabled = false
        
        // TODO: make this work
        // try out a different tile pattern (i.e. water color from stamen)
//        let path = MKTileOverlayPath(x: 0, y: 0, z: 1, contentScaleFactor: 0.34)
//        let tile = MKTileOverlay(URLTemplate: "http://tile.stamen.com/watercolor/{scale}/{x}/{x}.jpg")
//        mapView.addOverlay(tile)
        
        
        // style the text box for timer display
        timerTextView.backgroundColor = UIColor.blackColor()
        timerTextView.textColor = UIColor.whiteColor()
        timerTextView.selectable = false
        timerTextView.editable = false

        // when the game starts, zoom out from your position on a 3 second countdown
        // here we simulate that by triggering the zoom out after 5 seconds of launch
        var timer = NSTimer()
        timer = NSTimer.scheduledTimerWithTimeInterval(5, target: self, selector: Selector("zoomOut"), userInfo: nil, repeats: false)

    }
    
    func zoomOut() {
        let widthOfGameBoard = 0.2 // degrees
        let heightOfGameBoard = 0.2 // degrees
        let centerOfGameBoard = CLLocationCoordinate2D(
            latitude: 42.3601,
            longitude: -71.0689
        )
        let span = MKCoordinateSpanMake(widthOfGameBoard/2.0, heightOfGameBoard/2.0)
        let region = MKCoordinateRegion(center: centerOfGameBoard, span: span)
        
        //
        UIView.animateWithDuration(3.0,
            delay: 0.0,
            options: .CurveEaseInOut | .AllowUserInteraction,
            animations: {
                self.mapView.setRegion(region, animated: true);
            },
            completion: { finished in
                println("zoomed out!")
        })
    }
    
    func locationManager(manager: CLLocationManager!, didUpdateLocations locations: [AnyObject]!) {
        let location = locations.last as CLLocation
        
        let center = CLLocationCoordinate2D(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01))
        
        // move your icon and publish new location
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func theButtonIsPressed(sender: AnyObject) {
        // check the state of the button
        // then perform the appropriate action for the button
        Action.shout("testing")
    }
}




