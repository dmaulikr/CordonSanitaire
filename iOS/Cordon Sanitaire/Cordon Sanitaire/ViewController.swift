//
//  ViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 2/18/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import GameKit


class ViewController: UIViewController, GameDelegate {
    var patientZeroIcon: CAShapeLayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // code goes here
        
        // set background color
        self.view.backgroundColor = UIColor(netHex: cs_blue)
        
        // add buttons
        let playButton   = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        playButton.frame = CGRectMake(0, 0, 300, 50)
        playButton.center = CGPointMake(self.view.center.x, self.view.center.y)
        playButton.setTitle("PLAY", forState: UIControlState.Normal)
        playButton.titleLabel?.textColor = UIColor.whiteColor()
        playButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 48.0)
        playButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(playButton)
        
        let introButton   = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        introButton.frame = CGRectMake(0, 0, 300, 50)
        introButton.center = CGPointMake(self.view.center.x, self.view.center.y + 75)
        introButton.setTitle("INTRO", forState: UIControlState.Normal)
        introButton.titleLabel?.textColor = UIColor(netHex: cs_blue)
        introButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 48.0)
        introButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(introButton)
        
        Game.singleton.delegate = self
        
        self.authenticateLocalPlayer()
        
        
        let profileButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        profileButton.frame = CGRectMake(0, 0, 300, 50)
        profileButton.center = CGPointMake(self.view.center.x, self.view.center.y + 150)
        profileButton.setTitle("PROFILE", forState: UIControlState.Normal)
        profileButton.titleLabel?.textColor = UIColor(netHex: cs_blue)
        profileButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 48.0)
        profileButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(profileButton)
        
        addPZeroIcon()
        animatePZero()

    }
    
    
    // listen to the game for when to start
    func startGame() {
//        self.dismissViewControllerAnimated(true, completion: nil)
//        self.presentViewController(Game.singleton.viewController, animated: true, completion: nil)
        UIView.animateWithDuration(1.0,
            delay: 3.0,
            options: .CurveEaseInOut | .AllowUserInteraction,
            animations: {
                Lobby.singleton.viewController.view.frame = CGRectMake(0, -self.view.frame.height, self.view.frame.width, self.view.frame.height);
            },
            completion: { finished in
                Lobby.singleton.viewController.view.removeFromSuperview()
        })


    }
    
    // handle the button presses (open the map view, or open the intro view)
    func onButtonPress(sender:UIButton!) {
        println("button pressed")
       
        if(sender.titleLabel?.text == "PLAY"){
            // display the map view
//            self.presentViewController(Lobby.singleton.viewController!, animated: true, completion: nil)
            self.presentViewController(Game.singleton.viewController, animated: true, completion: nil)
        }
        else if(sender.titleLabel?.text == "INTRO") {
            // display the map view
            let introViewController:IntroViewController = IntroViewController()
            self.presentViewController(introViewController, animated: true, completion: nil)
        }
        else if(sender.titleLabel?.text == "PROFILE") {
            //go to ProfileViewController
            let profileViewController:ProfileViewController = ProfileViewController()
            self.presentViewController(profileViewController, animated: true, completion: nil)
        }
    }
    
    func addPZeroIcon() {
        patientZeroIcon = CAShapeLayer()
        
        let radius: CGFloat = 50.0
        let center: CGPoint = CGPointMake(self.view.center.x, self.view.center.y - 3*radius)
        let startAngle = 0.0
        let endAngle = 2.0 * Double(M_PI)
        
        patientZeroIcon.lineWidth = 20.0
        patientZeroIcon.fillColor = UIColor(netHex: cs_red).CGColor
        patientZeroIcon.strokeColor = UIColor.whiteColor().CGColor
        patientZeroIcon.path = UIBezierPath(arcCenter: center, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(endAngle), clockwise: true).CGPath
        self.view.layer.addSublayer(patientZeroIcon)
        
    }
    
    func animatePZero() {
        UIView.animateWithDuration(NSTimeInterval.infinity, animations: { () -> Void in
            // Create a blank animation using keyPath "cornerRadius"
            let pZeroAnimation = CABasicAnimation(keyPath: "lineWidth")
            
            //define parameters for tween
            pZeroAnimation.fromValue = 15.0
            pZeroAnimation.toValue = 7.5
            pZeroAnimation.autoreverses = true
            pZeroAnimation.duration = 4.0
            pZeroAnimation.repeatDuration = CFTimeInterval.infinity
            pZeroAnimation.timingFunction = CAMediaTimingFunction(controlPoints: 0.25, 0, 0.75, 1)
            
            self.patientZeroIcon.addAnimation(pZeroAnimation, forKey: "lineWidth")
        })
    }
    
    
    //
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(false)
        animatePZero()
    }
    
    // Gamekit authentication for player, displays the log in view for gamekit
    func authenticateLocalPlayer() {
        
        var localPlayer = GKLocalPlayer.localPlayer()
        
        localPlayer.authenticateHandler = {(viewController : UIViewController!, error : NSError!) -> Void in
            if (viewController != nil) {
                self.presentViewController(viewController, animated: true, completion: nil)
                
            } else if(localPlayer.authenticated) {
                // go to lobby page
                // check if username exists in Parse
                Client.singleton.login(localPlayer)
                
            } else {
                NSLog("WARNING: User not authenticated")
                // TODO: go to page that explains that the user needs to login
            }
        }
    }
    
    func showRetryAlert(){
        let alertController = UIAlertController(title: "iOScreator", message:
            "Hello, world!", preferredStyle: UIAlertControllerStyle.Alert)
        alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.Default,handler: nil))
        
        self.presentViewController(alertController, animated: true, completion: nil)
    }
    

}




