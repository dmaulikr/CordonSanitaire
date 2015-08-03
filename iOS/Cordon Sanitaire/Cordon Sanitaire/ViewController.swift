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
        
        // set background color
        self.view.backgroundColor = UIColor.whiteColor()
        
        //add title and buttons
        addTitle()
        addButtons()
        addStatDots()
        
        //add image
        /*
        var icon = UIImageView(frame: CGRectMake(0, 0, 50, 50))
        icon.image = UIImage(named: "AppIcon")
        icon.layer.cornerRadius = 5.0
        self.view.addSubview(icon)
*/
        
        let credits = UILabel(frame: CGRectMake(0, self.view.frame.height - 30, 160, 20))
        credits.center = CGPointMake(self.view.frame.width/2, self.view.frame.height - 15)
        credits.text = "MIT Media Lab | Playful Systems"
        credits.font = UIFont(name: "helvetica neue", size: 10)
        credits.textColor = UIColor(netHex: cs_blue)
        credits.alpha = 0.7
        self.view.addSubview(credits)
        
        
  
        Game.singleton.delegate = self
        
        self.authenticateLocalPlayer()

    }
    
    // listen to the game for when to start
    func startGame() {
//        self.dismissViewControllerAnimated(true, completion: nil)
//        self.presentViewController(Game.singleton.viewController, animated: true, completion: nil)
        UIView.animateWithDuration(1.0,
            delay: 0.0,
            options: .CurveEaseInOut | .AllowUserInteraction,
            animations: {
                Lobby.singleton.viewController.view.frame = CGRectMake(0, -self.view.frame.height, self.view.frame.width, self.view.frame.height);
            },
            completion: { finished in
                Lobby.singleton.viewController.view.removeFromSuperview()
        })


    }
    
    func addButtons() {
        
        let menuFontSize:CGFloat = 24.0
        let menuLineHeight:CGFloat = 48.0
        let menuTop:CGFloat = 125
        
        
        let profileButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        profileButton.frame = CGRectMake(20, menuTop, self.view.frame.width, 40)
        profileButton.setTitle("Profile", forState: UIControlState.Normal)
        profileButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        profileButton.titleLabel?.font = UIFont(name: "helvetica neue", size: menuFontSize)
        profileButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        profileButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(profileButton)
        
        
        let introButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        introButton.frame = CGRectMake(20, menuTop + menuLineHeight, self.view.frame.width, 40)
        introButton.setTitle("Intro", forState: UIControlState.Normal)
        introButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        introButton.titleLabel?.font = UIFont(name: "helvetica neue", size: menuFontSize)
        introButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        introButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(introButton)
        
        let aboutButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        aboutButton.frame = CGRectMake(20, menuTop + 2 * menuLineHeight, self.view.frame.width, 40)
        aboutButton.setTitle("About", forState: UIControlState.Normal)
        aboutButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        aboutButton.titleLabel?.font = UIFont(name: "helvetica neue", size: menuFontSize)
        aboutButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        aboutButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(aboutButton)
        
        let shareButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        shareButton.frame = CGRectMake(20, menuTop + 3 * menuLineHeight, self.view.frame.width, 40)
        shareButton.setTitle("Share", forState: UIControlState.Normal)
        shareButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        shareButton.titleLabel?.font = UIFont(name: "helvetica neue", size: menuFontSize)
        shareButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        shareButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(shareButton)
        
        let howToButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        howToButton.frame = CGRectMake(20, menuTop + 4 * menuLineHeight, self.view.frame.width, 40)
        howToButton.setTitle("How To", forState: UIControlState.Normal)
        howToButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        howToButton.titleLabel?.font = UIFont(name: "helvetica neue", size: menuFontSize)
        howToButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        howToButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(howToButton)
        
        let tcButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        
        tcButton.frame = CGRectMake(20, menuTop + 5 * menuLineHeight, self.view.frame.width, 40)
        tcButton.setTitle("Terms & Conditions", forState: UIControlState.Normal)
        tcButton.setTitleColor(UIColor(netHex: cs_blue), forState: UIControlState.Normal)
        tcButton.titleLabel?.font = UIFont(name: "helvetica neue", size: menuFontSize)
        tcButton.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Left
        tcButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(tcButton)
        
    }
    
    func addStatDots() {
        
        let dotBack1 = UIView(frame: CGRectMake(self.view.frame.width - 15, 3*self.view.frame.height/6 + 5, 30, 30))
        let dotBack2 = UIView(frame: CGRectMake(self.view.frame.width - 15, 2*self.view.frame.height/3 - 15, 30, 30))
        let dotBack3 = UIView(frame: CGRectMake(self.view.frame.width - 15, 5*self.view.frame.height/6 - 35, 30, 30))
        dotBack1.backgroundColor = UIColor(netHex: cs_blue)
        dotBack2.backgroundColor = UIColor(netHex: cs_blue)
        dotBack3.backgroundColor = UIColor(netHex: cs_blue)
        dotBack1.layer.cornerRadius = 16
        dotBack2.layer.cornerRadius = 16
        dotBack3.layer.cornerRadius = 16
        
        self.view.addSubview(dotBack1)
        self.view.addSubview(dotBack2)
        self.view.addSubview(dotBack3)
        
        let dot1 = UIView(frame: CGRectMake(self.view.frame.width - 10, 1*self.view.frame.height/2 + 10, 20, 20))
        let dot2 = UIView(frame: CGRectMake(self.view.frame.width - 10, 2*self.view.frame.height/3 - 10, 20, 20))
        let dot3 = UIView(frame: CGRectMake(self.view.frame.width - 10, 5*self.view.frame.height/6 - 30, 20, 20))
        dot1.backgroundColor = UIColor(netHex: cs_yellow)
        dot2.backgroundColor = UIColor.whiteColor()
        dot3.backgroundColor = UIColor(netHex: cs_orange)
        dot1.layer.cornerRadius = 10
        dot2.layer.cornerRadius = 10
        dot3.layer.cornerRadius = 10
        
        self.view.addSubview(dot1)
        self.view.addSubview(dot2)
        self.view.addSubview(dot3)
        
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
            self.presentViewController(Game.singleton.viewController, animated: true, completion: nil)

        }
        else if(sender.titleLabel?.text == "Share"){
            let mapViewController: MapViewController = MapViewController()
            self.presentViewController(mapViewController, animated: true, completion: nil)
            
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
    
    
    // TODO: why is this function here? left over from a tutorial? -jb
    func showRetryAlert(){
//        let alertController = UIAlertController(title: "iOScreator", message:
//            "Hello, world!", preferredStyle: UIAlertControllerStyle.Alert)
//        alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.Default,handler: nil))
//        
//        self.presentViewController(alertController, animated: true, completion: nil)
    }

    func addTitle(){
        
        let titleFontSize:CGFloat = 36.0
        
        let title = UILabel()
        title.frame = CGRectMake(20, 10, 300, 100)
        title.font = UIFont(name: "HelveticaNeue-Bold", size: titleFontSize)
        title.textColor = UIColor(netHex: cs_navy)
        title.numberOfLines = 2
        
        title.text = "Cordon\nSanitaire"
        
        self.view.addSubview(title)
    }
    
}




