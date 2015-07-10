//
//  ProfileViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import GameKit
import QuartzCore



protocol ProfileViewDelegate {
   func didFinishViewingProfile()
}

class ProfileViewController: UIViewController {
    
    var delegate:ProfileViewDelegate!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let background = UIView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: self.view.frame.height))
        background.backgroundColor = UIColor.whiteColor()
        let backgroundHalf = UIView(frame: CGRect(x: self.view.frame.width/8, y: 0, width: 7*self.view.frame.width/8, height: self.view.frame.height))
        backgroundHalf.backgroundColor = UIColor(netHex: cs_blue)
        
        self.view.addSubview(background)
        self.view.addSubview(backgroundHalf)

        // Do any additional setup after loading the view.
        
        addBackButton()
        addGameCenterProfile()
        
    }
    
    
    func addBackButton(){
        //Button to return to home screen.
        let backButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        backButton.frame = CGRectMake(self.view.frame.width/2, self.view.frame.height - 50, self.view.frame.width - 100, 50)
        //backButton.center = self.view.center
        backButton.setTitle("go back", forState: UIControlState.Normal)
        backButton.setTitleColor(UIColor.blueColor(), forState: UIControlState.Normal)
        backButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 20)
        backButton.alpha = 1.0
        backButton.addTarget(self, action: "backButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(backButton)
        //Play around with: font (cutive cuts off at top), alignment, button padding

    }


    func backButtonPress(sender: UIButton!){
        let rootViewController: UIViewController = ViewController()
        self.presentViewController(rootViewController, animated: true, completion: nil)
    }
    
    func addGameCenterProfile(){
        //Displays Game Center username and image.
        let userNameDisplay = UILabel()
        userNameDisplay.frame = CGRectMake(self.view.center.x/4 + 10, 0, self.view.frame.width - 20, 50)
        userNameDisplay.font = UIFont(name: "helvetica neue", size: 30)
        
        let userImageBack = UIImageView()
        userImageBack.frame = CGRectMake(0, 0, 200, 200)
        userImageBack.center = CGPointMake(self.view.center.x + self.view.center.x/16, self.view.center.y - 120)
        userImageBack.layer.cornerRadius = 100
        userImageBack.backgroundColor = UIColor.whiteColor()
        self.view.addSubview(userImageBack)
        
        var userImageDisplay = UIImageView(image: nil)
        userImageDisplay.frame = CGRectMake(0, 0, 150, 150)
        userImageDisplay.center = CGPointMake(self.view.center.x + self.view.center.x/16, self.view.center.y - 120)
        userImageDisplay.layer.cornerRadius = 75
        userImageDisplay.clipsToBounds = true
        userImageDisplay.backgroundColor = UIColor.blueColor()
        
        var localPlayer = GKLocalPlayer.localPlayer()
        
        if(localPlayer.authenticated) {
            var userName: String = localPlayer.alias
            userNameDisplay.text = userName
            self.view.addSubview(userNameDisplay)
            
            localPlayer.loadPhotoForSize(GKPhotoSizeNormal, withCompletionHandler: {(image, error) -> Void in
                if let theError = error {
                    println("Cannot load image.")
                    //userImageDisplay.image =
                } else if let theImage = image {
                    userImageDisplay.image = theImage
                }
            }
            )
            
            self.view.addSubview(userImageDisplay)
            
        } else {
            var userName: String = "Game Center Error"
            userNameDisplay.text = userName
            self.view.addSubview(userNameDisplay)
        }
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

