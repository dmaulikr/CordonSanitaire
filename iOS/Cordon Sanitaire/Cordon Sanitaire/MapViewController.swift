//
//  MapViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import MapKit
import QuartzCore

class MapViewController: UIViewController, MKMapViewDelegate, CLLocationManagerDelegate{

    var mapView: MKMapView!
    var notificationsView: UIView!

    let locationManager = CLLocationManager()
        
    // UI elements
    let timerTextView:UITextView = UITextView()
    let duration = 45.0
    var timeLeft = 45.0
    var gameTimer = NSTimer()
    var bStartOfTimer = false
    var startTime = 0.0
    
    var theButton = UIButton()
    
    var endPopView = UIView()
    var endBack = UIView()
    //var endTextView: UITextView = UITextView()
    var timeOver: Bool = false
    
    
    var patientZeroIndicator:CAShapeLayer!
    
    var playerIcons = [String: PlayerAnnotation]()
    var activePlayerIcons = [String: MKAnnotation]()
    var passivePlayerIcons = [String: MKAnnotation]()
    var trappedPlayerIcons = [String: MKAnnotation]()
    
    // Polygon handles 3+ coordinates
    // Polyline handles line between 2 coordinates
    var quarantinePolygon:MKPolygon = MKPolygon()
    var quarantinePolyline:MKPolyline = MKPolyline()
        
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // setup functions for GUI
        addMap()
        addTimer()
        addButton()
        addStatus()
        self.view.addSubview(Lobby.singleton.viewController.view)
    }
    
    override func viewDidAppear(animated: Bool) {
//        addNotificationsView()

        addStatusAnimation()    // show the patient zero
    }
    
    func start(){
        // when the game starts, zoom out from your position on a 3 second countdown
        // here we simulate that by triggering the zoom out after 3 seconds of launch
        var timer = NSTimer()
        timer = NSTimer.scheduledTimerWithTimeInterval(3, target: self, selector: Selector("zoomOut"), userInfo: nil, repeats: false)
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
        /*
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


        }) */
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
        //locationManager.requestAlwaysAuthorization()    // Not sure if this is necessary, really only need location when in app
        
        // will cause map to zoom nicely to user location
        mapView.userTrackingMode = .Follow
        
        // center on the users location, determined already
        // TODO: return the map to the users location
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

        // Add tile overlays here
//        let template = "http://tile.stamen.com/toner/{z}/{x}/{y}.jpg"
//        let overlay = MKTileOverlay(URLTemplate: template)
//        overlay.canReplaceMapContent = true
//        self.mapView.addOverlay(overlay, level: MKOverlayLevel.AboveLabels)
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

    // updates the annotations
    func updatePlayer(id: String, state: State){
        if(playerIcons[id] != nil ) {
            playerIcons[id]!.changeState(state)
            if (mapView != nil){
                var annotation = self.mapView.viewForAnnotation(playerIcons[id])
                if (annotation is PlayerAnnotationView){
                    (annotation as! PlayerAnnotationView).setCustomMarkerColor(getMarkerColor(state))
                }
            }
        }
        else {
            println("Received message from player that we don't think exists! " + id)
        }

    }

    func getMarkerColor(state: State) -> UIColor {
        var color = UIColor.blackColor()
        switch(state){
        case State.Trapped:
            color = UIColor(netHex: cs_orange)
        case State.Active:
            color = UIColor(netHex: cs_yellow)
        case State.Passive:
            color = UIColor(netHex: cs_blue)
        default:
            NSLog("No color associated with this state")
        }
        
        return color
    }
    
    
    // creates our initial annotations
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
        
        view!.image = UIImage(contentsOfFile: "blank")
        
        switch((annotation as! PlayerAnnotation).state){
        case State.Trapped:
            view!.setCustomMarkerColor(UIColor(netHex: cs_orange))
        case State.Active:
            view!.setCustomMarkerColor(UIColor(netHex: cs_yellow))
        case State.Passive:
            view!.setCustomMarkerColor(UIColor(netHex: cs_blue))
        default:
            NSLog("No color associated with this state")
        }
        
        return view
    }

    // notifications for actions in the Game
    func addNotificationsView() {
        notificationsView = UIView(frame: CGRectMake(0, 0, self.view.frame.width, self.view.frame.height))
        notificationsView.backgroundColor = UIColor(netHex: cs_blue)
        notificationsView.alpha = 0.9
        self.view.addSubview(notificationsView)
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
    
    //func endScreen(){
        
    func addPopover() {
            if (timeOver == true){
                endBack.frame = CGRectMake(0, 0, self.view.frame.width, self.view.frame.height)
                endBack.backgroundColor = UIColor.blackColor()
                endBack.alpha = 0.0
                
                
                let box = CGRectMake(20, 50, self.view.frame.width - 40, self.view.frame.height - 90)
                endPopView = UIView(frame: box)
                //endPop.center = CGPoint(x:self.view.center.x, y:self.view.frame.height)
                endPopView.backgroundColor = UIColor.whiteColor()
                endPopView.alpha = 0.0
                endPopView.layer.cornerRadius = 25
                self.view.addSubview(endBack)
                self.view.addSubview(endPopView)
                self.view.bringSubviewToFront(endPopView)

                var endTextView: UILabel = UILabel()
                endTextView.frame = CGRectMake(25, 70, box.width-50, 50)
                endTextView.text = "Game Over"
                endTextView.textColor = UIColor.blackColor()
                endTextView.font = UIFont(name: "Cutive-Regular", size: 20)
                endTextView.backgroundColor = UIColor.clearColor()
                endTextView.alpha = 0.0
                endTextView.textAlignment = NSTextAlignment.Center
                
                /*//var endContentView: UIWebView = UIWebView()
                let myWebView:UIWebView = UIWebView(frame: CGRectMake(0, 0, UIScreen.mainScreen().bounds.width, UIScreen.mainScreen().bounds.height))
                myWebView.loadRequest(NSURLRequest(URL: NSURL(string: "http://www.sourcefreeze.com")!))
                self.view.addSubview(myWebView)
*/

                let backButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
                backButton.frame = CGRectMake(0, 0, 100, 60)
                //backButton.center = self.view.center
                backButton.setTitle("Go Back", forState: UIControlState.Normal)
                backButton.setTitleColor(UIColor.blackColor(), forState: UIControlState.Normal)
                backButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 10)
                backButton.alpha = 0.0
                backButton.addTarget(self, action: "backButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
                
                
                endPopView.addSubview(endTextView)
                endPopView.addSubview(backButton)
                
                UIView.animateWithDuration(0.8,
                    delay: 1.5,
                    options: nil,
                    animations: {
                        self.endPopView.alpha = 1.0;
                        endTextView.alpha = 1.0;
                        backButton.alpha = 1.0;
                        self.endBack.alpha = 0.4;
                    },
                    
                    completion: nil)
                
                endPopView.bringSubviewToFront(endTextView)
                endPopView.bringSubviewToFront(backButton)
                
                
                
                //endPopView.addSubview(endTextView) //nested views
                
                //Close button, return to root view controller.
                
            }

        }
    
    func addPlayerToMap(location:CLLocationCoordinate2D, playerID:String) {
        // place a pin to show that we can place annotations
        let annotation = PlayerAnnotation(state: Game.singleton.players[playerID]!.state, coordinate: location)
        
        if (mapView != nil) {
            if (playerIcons[playerID] != nil){
                mapView.removeAnnotation(playerIcons[playerID])
            }
            mapView.addAnnotation(annotation)
        }
        
        // keey track of our players annotation
        playerIcons[playerID] = annotation
        activePlayerIcons[playerID] = annotation
    }
    
    // receive array of coordinates and update polygon of quarantine
    func updateQuarantine(quarantine:[CLLocationCoordinate2D]) {
        
        if (self.mapView != nil) {
            if(quarantine.count < 2 ){
                // no quarantine to draw
                self.mapView.removeOverlay(quarantinePolygon)
                self.mapView.removeOverlay(quarantinePolyline)
            }
            else if( quarantine.count == 2){
                // just a line to draw, getting closer
                var coords = [CLLocationCoordinate2D]()
                for player in quarantine {
                    coords.append(player)
                }
                let polyLine:MKPolyline = MKPolyline(coordinates: &coords, count: coords.count)
                self.mapView.addOverlay(polyLine)
                self.mapView.removeOverlay(quarantinePolygon)
                self.mapView.removeOverlay(quarantinePolyline)
                quarantinePolyline = polyLine
            }
            else {
                // Houston, we have a quarantine! Let's draw it :)
                var coords = [CLLocationCoordinate2D]()
                for player in quarantine {
                    coords.append(player)
                }
                let polygon:MKPolygon = MKPolygon(coordinates: &coords, count: coords.count)
                self.mapView.addOverlay(polygon)
                self.mapView.removeOverlay(quarantinePolygon)
                self.mapView.removeOverlay(quarantinePolyline)
                quarantinePolygon = polygon
            }
        }
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
            v.strokeColor = UIColor(hue: 0, saturation: 1.0, brightness: 1.0, alpha: 0.9)
            v.lineWidth = 4
        }
        else if let overlay = overlay as? MKPolyline {
            
            var line : MKPolylineRenderer! = nil
            line = MKPolylineRenderer(polyline: overlay)
            line.strokeColor = UIColor(hue: 0.5, saturation: 1.0, brightness: 1.0, alpha: 0.9)
            line.lineWidth = 4
            
            return line
        }
        else if let overlay = overlay as? MKTileOverlay {
            
            return MKTileOverlayRenderer(overlay: overlay)
        }
        
        return v
    }
    
    func revealPatientZero() {
        
    }
    
    func zoomOut() {

        let centerOfGameBoard = Game.singleton.getCenterOfGameMap()
        let span = Game.singleton.getWidthAndHeightOfGameMap()
        let region = MKCoordinateRegion(center: centerOfGameBoard, span: span)

        // check to see if region is valid
        if(region.center.latitude == 0.0 && region.center.longitude == 0.0) {
            println("no players in the game")
            return
        }
        
        // zoom out the map with an animation
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
                
                // Animate the transition of an overlay, in this case the notification view.
                // Animating takes place by simply setting the frame to a new location or size
                UIView.animateWithDuration(1.0,
                delay: 3.0,
                options: .CurveEaseInOut | .AllowUserInteraction,
                animations: {
//                    self.notificationsView.frame = CGRectMake(0, 0, self.view.frame.width, 60);

                },
                completion: { finished in
                    println("transitioned!")
                })

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
            timeOver = true
            addPopover()
        }
        else {
            timerTextView.text = NSString(format: "00:%@%.2f", (timeLeft < 10.0) ? "0" : "", timeLeft) as String            
        }
    }
    
    

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    func locationManager(manager: CLLocationManager!, didUpdateLocations locations: [AnyObject]!) {
        let location = locations.last as! CLLocation
        
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
//                UIView.animateWithDuration(duration:.5 animation
//                    
//                }
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
    
    func backButtonPress(sender: UIButton!){
        let rootViewController: UIViewController = ViewController()
        self.presentViewController(rootViewController, animated: true, completion: nil)
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
