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
        
        let introButton   = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        introButton.frame = CGRectMake(20, 125,65, 40)
        introButton.setTitle("Intro", forState: UIControlState.Normal)
        introButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        introButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 30.0)
        introButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(introButton)
        
        Game.singleton.delegate = self
        
        self.authenticateLocalPlayer()
        
        
        let profileButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        profileButton.frame = CGRectMake(20, 165, 85, 40)
        profileButton.setTitle("Profile", forState: UIControlState.Normal)
        profileButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        profileButton.titleLabel!.font = UIFont(name: "helvetica neue", size: 30.0)
        profileButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(profileButton)
        

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
        cordon.font = UIFont(name: "helvetica neue", size: 45)
        cordon.textColor = UIColor(netHex: cs_navy)
        sanitaire.frame = CGRectMake(20, 55, 300, 45)
        sanitaire.font = UIFont(name: "helvetica neue", size: 45)
        sanitaire.textColor = UIColor(netHex: cs_navy)

        cordon.text = "CORDON"
        sanitaire.text = "SANITAIRE"
        
        self.view.addSubview(cordon)
        self.view.addSubview(sanitaire)
        
        
    }
    
}




