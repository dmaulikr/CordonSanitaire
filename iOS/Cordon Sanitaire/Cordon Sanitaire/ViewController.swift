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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // code goes here
        
        // set background color
        self.view.backgroundColor = UIColor.whiteColor()
        
        //add title
        addTitle()

        
        // add buttons
        
        let profileButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        profileButton.frame = CGRectMake(20, 125, self.view.frame.width, 40)
        profileButton.setTitle("Profile", forState: UIControlState.Normal)
        profileButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        profileButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        profileButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        profileButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(profileButton)
        
        
        let introButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        introButton.frame = CGRectMake(20, 175, self.view.frame.width, 40)
        introButton.setTitle("Intro", forState: UIControlState.Normal)
        introButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        introButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        introButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        introButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(introButton)
        
        let aboutButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        aboutButton.frame = CGRectMake(20, 225, self.view.frame.width, 40)
        aboutButton.setTitle("About", forState: UIControlState.Normal)
        aboutButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        aboutButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        aboutButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        aboutButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(aboutButton)
        
        let shareButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        shareButton.frame = CGRectMake(20, 275, self.view.frame.width, 40)
        shareButton.setTitle("Share", forState: UIControlState.Normal)
        shareButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        shareButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        shareButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        shareButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(shareButton)
        
        let howToButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        howToButton.frame = CGRectMake(20, 325, self.view.frame.width, 40)
        howToButton.setTitle("How To", forState: UIControlState.Normal)
        howToButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        howToButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        howToButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        howToButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(howToButton)
        
        let tcButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        tcButton.frame = CGRectMake(20, 375, self.view.frame.width, 40)
        tcButton.setTitle("Terms & Conditions", forState: UIControlState.Normal)
        tcButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        tcButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        tcButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        tcButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(tcButton)
        
        
        Game.singleton.delegate = self
        
        self.authenticateLocalPlayer()

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
        else if(sender.titleLabel?.text == "Intro") {
            // display the map view
            let introViewController:IntroViewController = IntroViewController()
            self.presentViewController(introViewController, animated: true, completion: nil)
        }
        else if(sender.titleLabel?.text == "Profile") {
            //go to ProfileViewController
            let profileViewController:ProfileViewController = ProfileViewController()
            self.presentViewController(profileViewController, animated: true, completion: nil)
        }
        else if(sender.titleLabel?.text == "About") {
            
        }
        else if(sender.titleLabel?.text == "Share"){
            
        }
        else if(sender.titleLabel?.text == "How To"){
            
        }
        else if(sender.titleLabel?.text == "Terms & Conditions"){
            
        }
    }
    
    
    //
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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

    func addTitle(){
        let cordon = UILabel()
        let sanitaire = UILabel()
        cordon.frame = CGRectMake(20, 10, 300, 45)
        cordon.font = UIFont(name: "helvetica neue", size: 43)
        cordon.textColor = UIColor(netHex: cs_navy)
        sanitaire.frame = CGRectMake(20, 55, 300, 45)
        sanitaire.font = UIFont(name: "helvetica neue", size: 43)
        sanitaire.textColor = UIColor(netHex: cs_navy)

        cordon.text = "CORDON"
        sanitaire.text = "SANITAIRE"
        
        self.view.addSubview(cordon)
        self.view.addSubview(sanitaire)
        
        
    }
    
}




