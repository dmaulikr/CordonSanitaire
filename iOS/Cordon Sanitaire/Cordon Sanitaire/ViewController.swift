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
        self.view.backgroundColor = UIColor.blackColor()
        
        // add buttons
        let playButton   = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        playButton.frame = CGRectMake(0, 0, 300, 50)
        playButton.center = self.view.center
        playButton.setTitle("PLAY", forState: UIControlState.Normal)
        playButton.titleLabel?.textColor = UIColor.whiteColor()
        playButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 48.0)
        playButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(playButton)
        
        let introButton   = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        introButton.frame = CGRectMake(0, 0, 300, 50)
        introButton.center = CGPointMake(self.view.center.x, self.view.center.y + 75)
        introButton.setTitle("INTRO", forState: UIControlState.Normal)
        introButton.titleLabel?.textColor = UIColor.whiteColor()
        introButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 48.0)
        introButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(introButton)
        
        Game.singleton.delegate = self
        
        self.authenticateLocalPlayer()

    }
    
    // listen to the game for when to start
    func startGame() {
        self.presentViewController(Game.singleton.viewController, animated: true, completion: nil)
    }
    
    // handle the button presses (open the map view, or open the intro view)
    func onButtonPress(sender:UIButton!) {
        println("button pressed")
       
        if(sender.titleLabel?.text == "PLAY"){
            // display the map view
            self.presentViewController(Lobby.singleton.viewController!, animated: true, completion: nil)
//            Lobby.singleton.startGame()
//            self.presentViewController(Game.singleton.viewController!, animated: true, completion: nil)
        }
        else if(sender.titleLabel?.text == "INTRO") {
            // display the map view
            let introViewController:IntroViewController = IntroViewController()
            self.presentViewController(introViewController, animated: true, completion: nil)
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

}




