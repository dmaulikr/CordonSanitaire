//
//  MapViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import MapKit

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate {

    var mapView: MKMapView!

    let locationManager = CLLocationManager()
    
    // UI elements
    let timerTextView:UITextView = UITextView()
    let duration = 45.0
    var timeLeft = 45.0
    var gameTimer = NSTimer()
    var bStartOfTimer = false
    var startTime = 0.0
    
    var theButton = UIButton()
    
    var playerIcons = [String: MKAnnotation]()
    var activePlayerIcons = [String: MKAnnotation]()
    var passivePlayerIcons = [String: MKAnnotation]()
    var trappedPlayerIcons = [String: MKAnnotation]()
    
    var quarantinePolygon:MKPolygon = MKPolygon()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // setup functions for GUI
        addMap()
        addTimer()
        addButton()
        // add status
        
        // when the game starts, zoom out from your position on a 3 second countdown
        // here we simulate that by triggering the zoom out after 3 seconds of launch
        var timer = NSTimer()
        timer = NSTimer.scheduledTimerWithTimeInterval(3, target: self, selector: Selector("zoomOut"), userInfo: nil, repeats: false)
    }
    
    func addMap() {
        self.view.backgroundColor = UIColor.blackColor()
        
        // Do any additional setup after loading the view.
        mapView = MKMapView(frame: self.view.frame)
        mapView.delegate = self
        self.view.addSubview(mapView)
        
        locationManager.delegate = self
        // must request authorization to use location
        locationManager.requestWhenInUseAuthorization()
        
        // will cause map to zoom nicely to user location
        mapView.userTrackingMode = .Follow
        
        // sample pin location
        // 42.3601° N, 71.0589°
        let location = CLLocationCoordinate2D(
            latitude: 42.3601,
            longitude: -71.0589
        )
        addPlayerToMap(location, playerID: "location 1")
        
        let loc2 = CLLocationCoordinate2D(latitude: 42.3801, longitude: -71.0589)
        addPlayerToMap(loc2, playerID: "location 2")
        
        let loc3 = CLLocationCoordinate2D(latitude: 42.3801, longitude: -71.0389)
        addPlayerToMap(loc3, playerID: "location 3")
        
        // start at a zoomed in location on the player
        let span = MKCoordinateSpanMake(0.005, 0.005)
        let region = MKCoordinateRegion(center: location, span: span)
        mapView.setRegion(region, animated: true)
        
        // settings for the map to hide most information and prevent interaction with the map
        mapView.showsPointsOfInterest = false
        mapView.showsBuildings = false
        mapView.showsUserLocation = true
        mapView.scrollEnabled = false
        mapView.pitchEnabled = false
        mapView.rotateEnabled = false
        mapView.zoomEnabled = false
        mapView.userInteractionEnabled = false
        
        // eventually, update this to spring back user interaction to the proper window
        // feels better to nudge back than completely restrict the user from doing what they want
        
        // TODO: make this work
        // try out a different tile pattern (i.e. water color from stamen)
        //        let path = MKTileOverlayPath(x: 0, y: 0, z: 1, contentScaleFactor: 0.34)
        //        let tile = MKTileOverlay(URLTemplate: "http://tile.stamen.com/watercolor/{scale}/{x}/{x}.jpg")
        //        mapView.addOverlay(tile)
        
        
        // add the quarantine
        addQuarantineToMap()
    }
    
    func addPlayersToMap() {

        // test adding players from Game
        for playerID:String in Game.singleton.players.keys {
            
            let lat = Game.singleton.players[playerID]?.latitude
            let lon = Game.singleton.players[playerID]?.longitude
            let loc = CLLocationCoordinate2D(latitude: lat!, longitude: lon!)
            
            addPlayerToMap(loc, playerID: playerID)
        }

    }
    
    func mapView(mapView: MKMapView!, regionDidChangeAnimated animated: Bool) {
        // if the region changes, let's bring us back to where we want to be
        
        let widthOfGameBoard = 0.2 // degrees
        let heightOfGameBoard = 0.2 // degrees
        let centerOfGameBoard = CLLocationCoordinate2D(
            latitude: 42.3601,
            longitude: -71.0689
        )
        let span = MKCoordinateSpanMake(widthOfGameBoard/2.0, heightOfGameBoard/2.0)
        let region = MKCoordinateRegion(center: centerOfGameBoard, span: span)
    }
    
    func addButton() {
        // add a button to join, release, or shout
        let padding:CGFloat = 40.0
        theButton = UIButton(frame: CGRectMake(0,0, self.view.frame.width - padding*2.0, 80.0))
        theButton.center = CGPoint(x: self.view.center.x, y: self.view.frame.height - 80.0)
        theButton.setTitle("SHOUT", forState: UIControlState.Normal)
        theButton.backgroundColor = UIColor.blackColor()
        theButton.titleLabel?.font = UIFont(name: "helvetica", size: 48.0)
        theButton.addTarget(self, action: Selector("theButtonIsPressed:"), forControlEvents: UIControlEvents.TouchDown)
        self.view.addSubview(theButton)        
    }
    
    func addTimer() {
        //style the text box for timer display
        timerTextView.frame = CGRectMake(0, 0, self.view.frame.width, 100.0)
        self.view.addSubview(timerTextView)
        timerTextView.backgroundColor = UIColor.blackColor()
        timerTextView.textColor = UIColor.whiteColor()
        timerTextView.font = UIFont(name: "helvetica", size: 48.0)
        timerTextView.text = "00:00.00"
        timerTextView.selectable = false
        timerTextView.editable = false
    }
    
    func addPlayerToMap(location:CLLocationCoordinate2D, playerID:String) {
        // place a pin to show that we can place annotations
        let annotation = MKPointAnnotation()
        annotation.setCoordinate(location)
        annotation.title = "Red Pin"
        annotation.subtitle = "coolest location on the map"
        mapView.addAnnotation(annotation)
        
        // keey track of our players annotation
        playerIcons[playerID] = annotation
        activePlayerIcons[playerID] = annotation
    }
    
    func addQuarantineToMap() {
        
        var coords = [CLLocationCoordinate2D]()
        
        for player in activePlayerIcons {

            coords.append(player.1.coordinate)
        }
        
        quarantinePolygon = MKPolygon(coordinates: &coords, count: coords.count)
        mapView.addOverlay(quarantinePolygon)
    }
    
    // receive array of coordinates and update polygon of quarantine
    func updateQuarantine(quarantine:CLLocationCoordinate2D...) {
      
        var coords = [CLLocationCoordinate2D]()
        for player in quarantine {
            coords.append(player)
        }
        
        let polyLine:MKPolygon = MKPolygon(coordinates: &coords, count: coords.count)
        
        self.mapView.addOverlay(polyLine)
        
        self.mapView.removeOverlay(quarantinePolygon)
        
        quarantinePolygon = polyLine
    }
    
    func mapView(mapView: MKMapView!, viewForOverlay overlay: MKOverlay!) -> MKOverlayView! {
    
        var overlay : MKOverlayView! = nil
        
        println("waiting for overlay")
        
        return overlay
    }
    
    func mapView(mapView: MKMapView!, rendererForOverlay overlay: MKOverlay!) -> MKOverlayRenderer! {
        
        var v : MKPolygonRenderer! = nil
        
        if let overlay = overlay as? MKPolygon {
            
            v = MKPolygonRenderer(polygon: overlay)
            v.fillColor = UIColor(hue: 0, saturation: 0, brightness: 0, alpha: 0.3)
            v.strokeColor = UIColor(hue: 0, saturation: 0, brightness: 0, alpha: 0.9)
            v.lineWidth = 4
        }
        
        return v
    }
    
    func revealPatientZero() {
        
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
                // start game timer
                var gameTimer = NSTimer()
                gameTimer = NSTimer.scheduledTimerWithTimeInterval(0.01, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        })
    }
    
    func updateTimer() {
        
        if(!bStartOfTimer){
            startTime = NSDate().timeIntervalSince1970
            bStartOfTimer = true
        }
        
        timeLeft = duration - (NSDate().timeIntervalSince1970 - startTime)        
        
        if(timeLeft < 0.0) {
            gameTimer.invalidate()
            gameTimer.isEqual(nil)
            timerTextView.text = "00:00.00"
        }
        else {
            timerTextView.text = NSString(format: "00:%.2f",  timeLeft)
            
            //animateQuarantine()
            
        }
    }

    func animateQuarantine() {
        // test animating the overlay
        var a :MKAnnotation = activePlayerIcons["location 3"]!
        a.setCoordinate!(CLLocationCoordinate2D(latitude: a.coordinate.latitude + 0.00002, longitude: a.coordinate.longitude))
        activePlayerIcons["location 3"] = a
        
        var coords = [CLLocationCoordinate2D]()
        for player in activePlayerIcons {
            coords.append(player.1.coordinate)
        }
        var polyLine:MKPolygon = MKPolygon(coordinates: &coords, count: coords.count)
        self.mapView.addOverlay(polyLine)
        self.mapView.removeOverlay(quarantinePolygon)
        
        quarantinePolygon = polyLine
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    func locationManager(manager: CLLocationManager!, didUpdateLocations locations: [AnyObject]!) {
        let location = locations.last as CLLocation
        
        let center = CLLocationCoordinate2D(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01))
        
        // move your icon and publish new location
    }
    
    
    func theButtonIsPressed(sender: AnyObject) {
        // check the state of the button
        // then perform the appropriate action for the button
        println("the button is actually pressed");
        Action.shout("testing")
    }
    
    func menuButtonPressed(sender: AnyObject) {
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
