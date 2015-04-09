//
//  MapViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import MapKit

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate{

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
    
    var patientZeroIndicator:CAShapeLayer!
    
    var playerIcons = [String: PlayerAnnotation]()
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
        addStatus()
        
        // when the game starts, zoom out from your position on a 3 second countdown
        // here we simulate that by triggering the zoom out after 3 seconds of launch
        var timer = NSTimer()
        timer = NSTimer.scheduledTimerWithTimeInterval(3, target: self, selector: Selector("zoomOut"), userInfo: nil, repeats: false)
    }
    
    override func viewDidAppear(animated: Bool) {
        addStatusAnimation()
    }
    
    func addStatus() {
        
        self.patientZeroIndicator = CAShapeLayer()
        
        let radius:CGFloat = 15.0
        let center:CGPoint = CGPointMake(self.view.frame.width - radius - 15, radius + 15)
        let startAngle = 0.0
        let endAngle = 2.0 * Double(M_PI)
        
        patientZeroIndicator.lineWidth = 8.0
        patientZeroIndicator.fillColor = UIColor(netHex: cs_red).CGColor
        patientZeroIndicator.strokeColor = UIColor.whiteColor().CGColor
        patientZeroIndicator.path = UIBezierPath(arcCenter: center, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(endAngle), clockwise: true).CGPath
        self.view.layer.addSublayer(patientZeroIndicator)
    }
    
    func addStatusAnimation() {
        
        UIView.animateWithDuration( NSTimeInterval.infinity, animations: { () -> Void in
            
            // Create a blank animation using the keyPath "cornerRadius", the property we want to animate
            let pZeroAnimation = CABasicAnimation(keyPath: "lineWidth")
            
            // Define the parameters for the tween
            pZeroAnimation.fromValue = 8.0
            pZeroAnimation.toValue = 4.0
            pZeroAnimation.autoreverses  = true
            pZeroAnimation.duration = 2.0
            pZeroAnimation.repeatDuration = CFTimeInterval.infinity
            pZeroAnimation.timingFunction = CAMediaTimingFunction(controlPoints: 0.25, 0, 0.75, 1)
            
            // Finally, add the animation to the layer
            self.patientZeroIndicator.addAnimation(pZeroAnimation, forKey: "lineWidth")
        })
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
        
        // center on the users location, determined already
        // TODO: return the map to the users location
//        let location = CLLocationCoordinate2DMake(42.3601, -71.0589)
        let location = Game.singleton.myLocation
        
        // TODO: bring the players back to the map (currently the players array is empty)
        self.addPlayersToMap()
        
        // start at a zoomed in location on the player
        let span = MKCoordinateSpanMake(0.005, 0.005)
        let region = MKCoordinateRegion(center: location, span: span)
        mapView.setRegion(region, animated: true)
        
        // settings for the map to hide most information and prevent interaction with the map
        mapView.showsPointsOfInterest = false
        mapView.showsBuildings = false
        mapView.showsUserLocation = true
//        mapView.scrollEnabled = false
        mapView.pitchEnabled = false
//        mapView.rotateEnabled = false
//        mapView.zoomEnabled = false
//        mapView.userInteractionEnabled = false
        
        // eventually, update this to spring back user interaction to the proper window
        // feels better to nudge back than completely restrict the user from doing what they want
        
        // from maps.stamen.com, so free styled map tiles
        // watercolor, toner, terrain
        // more info:
        //  https://github.com/stamen/toner-carto
        //  https://github.com/Citytracking/toner
        //  http://content.stamen.com/dotspotting_toner_cartography_available_for_download
        let template = "http://tile.stamen.com/toner/{z}/{x}/{y}.jpg"
        let overlay = MKTileOverlay(URLTemplate: template)
        overlay.canReplaceMapContent = true
        self.mapView.addOverlay(overlay, level: MKOverlayLevel.AboveLabels)
        
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
    
    func updatePlayers() {
        for id:String in Game.singleton.players.keys {
            var player = Game.singleton.players[id]!
            self.updatePlayer(id, state: player.state)
        }
    }
    
    func updatePlayer(id: String, state: State){
        playerIcons[id]?.changeState(state)
        mapView(self.mapView, viewForAnnotation: playerIcons[id]!)
        self.mapView.viewForAnnotation(playerIcons[id]!)
    }
    
    func mapView(mapView: MKMapView!, viewForAnnotation annotation: MKAnnotation) -> MKAnnotationView! {
        if !(annotation is PlayerAnnotation) {
            return nil
        }
        
        
        let reuseId = "pin"
        
        var view = mapView.dequeueReusableAnnotationViewWithIdentifier(reuseId) as? PlayerAnnotationView
        
        if (view == nil){
            view = PlayerAnnotationView(annotation: annotation, reuseIdentifier: reuseId)
        } else {
            view!.annotation = annotation
        }
        
        switch((annotation as PlayerAnnotation).state){
        case State.Trapped:
            view!.pinColor = MKPinAnnotationColor.Red
        case State.Active:
            view!.pinColor = MKPinAnnotationColor.Purple
        case State.Passive:
            view!.pinColor = MKPinAnnotationColor.Green
        default:
            NSLog("No color associated with this state")
        }
        
        return view
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
        theButton.setTitle("JOIN", forState: UIControlState.Normal)
        theButton.backgroundColor = UIColor(netHex: cs_yellow)
        theButton.layer.cornerRadius = 40.0
        theButton.titleLabel?.font = UIFont(name: "HelveticaNeue-Bold", size: 36.0)
        theButton.addTarget(self, action: Selector("theButtonIsPressed:"), forControlEvents: UIControlEvents.TouchDown)
        self.view.addSubview(theButton)        
    }
    
    func addTimer() {
        //style the text box for timer display
        timerTextView.frame = CGRectMake(0, 0, self.view.frame.width, 60.0)
        self.view.addSubview(timerTextView)
        timerTextView.backgroundColor = UIColor(netHex: cs_blue)
        timerTextView.textColor = UIColor.whiteColor()
        timerTextView.font = UIFont(name: "HelveticaNeue-Bold", size: 36.0)
        timerTextView.text = "00:00.00"
        timerTextView.selectable = false
        timerTextView.editable = false
    }
    
    func addPlayerToMap(location:CLLocationCoordinate2D, playerID:String) {
        // place a pin to show that we can place annotations
        let annotation = PlayerAnnotation(state: Game.singleton.players[playerID]!.state, coordinate: location)
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
    func updateQuarantine(quarantine:[CLLocationCoordinate2D]) {
      
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
        else if let overlay = overlay as? MKTileOverlay {
            
            return MKTileOverlayRenderer(overlay: overlay)
        }
        
        return v
    }
    
    func revealPatientZero() {
        
    }
    
    func zoomOut() {
//        
//        let centerOfGameBoard = CLLocationCoordinate2DMake(42.3601, -71.0589)
//        let span = MKCoordinateSpanMake(0.1, 0.1)

        let centerOfGameBoard = Game.singleton.getCenterOfGameMap()
        let span = Game.singleton.getWidthAndHeightOfGameMap()
        let region = MKCoordinateRegion(center: centerOfGameBoard, span: span)

        // check to see if region is valid
        if(region.center.latitude == 0.0 && region.center.longitude == 0.0) {
            println("no players in the game")
            return
        }
        
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
    
    
    func theButtonIsPressed(sender: UIButton!) {
        // check the state of the button
        // then perform the appropriate action for the button
        let label = sender.titleLabel?.text
        
        switch(label!){
            case "JOIN":
                println("JOIN")
                theButton.setTitle("RELEASE", forState: UIControlState.Normal)
                theButton.backgroundColor = UIColor(netHex: cs_blue)
                if(Client.singleton.id != nil) {
                    Action.join(Client.singleton.id!)
                }
                break;
            
            case "RELEASE":
                println("RELEASE")
                theButton.setTitle("JOIN", forState: UIControlState.Normal)
                theButton.backgroundColor = UIColor(netHex: cs_yellow)
                if(Client.singleton.id != nil) {
                    Action.release(Client.singleton.id!)
                }
                break;
            
            case "SHOUT":
                println("SHOUT")
                if(Client.singleton.id != nil) {
                    Action.shout(Client.singleton.id!)
                }
                break;
        
            default: println("pressed the button, but no action assigned")
        }
        
        println("the button is actually pressed");
    }
    func showJoinButton(){
        theButton.setTitle("JOIN", forState: UIControlState.Normal)
        theButton.backgroundColor = UIColor(netHex: cs_yellow)
    }
    
    func showShoutButton(){
        theButton.setTitle("SHOUT", forState: UIControlState.Normal)
        theButton.backgroundColor = UIColor(netHex: cs_orange)
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
