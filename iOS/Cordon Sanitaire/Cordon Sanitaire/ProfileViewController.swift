//
//  ProfileViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import GameKit



protocol ProfileViewDelegate {
   func didFinishViewingProfile()
}

class ProfileViewController: UIViewController {
    
    var delegate:ProfileViewDelegate!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let background = UIView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: self.view.frame.height))
        background.backgroundColor = UIColor.whiteColor()
        self.view.addSubview(background)

        // Do any additional setup after loading the view.
        
        //Return to home screen.
        let backButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        backButton.frame = CGRectMake(self.view.frame.width/2, self.view.frame.height - 50, self.view.frame.width - 100, 50)
        //backButton.center = self.view.center
        backButton.setTitle("go back", forState: UIControlState.Normal)
        backButton.setTitleColor(UIColor.blueColor(), forState: UIControlState.Normal)
        backButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 20)
        backButton.alpha = 1.0
        backButton.addTarget(self, action: "buttonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(backButton)
        //Play around with: font (cutive cuts off at top), alignment, button padding
        
        let userNameDisplay = UILabel()
        userNameDisplay.frame = CGRectMake(10, 0, self.view.frame.width - 20, 50)
        userNameDisplay.font = UIFont(name: "helvetica neue", size: 20)
        var localPlayer = GKLocalPlayer.localPlayer()
        if(localPlayer.authenticated) {
            var userName: String = localPlayer.alias
            userNameDisplay.text = userName
            self.view.addSubview(userNameDisplay)
        } else {
            var userName: String = "Game Center Error"
            userNameDisplay.text = userName
            self.view.addSubview(userNameDisplay)
        }
    }


    func buttonPress(sender: UIButton!){
        let rootViewController: UIViewController = ViewController()
        self.presentViewController(rootViewController, animated: true, completion: nil)
    }
    
    func show() {
        // animate in the components of this view
    }
    
    func hide() {
        // animate out the components of this view
        
        // tell the delegate to remove us from the view
        delegate.didFinishViewingProfile()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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

