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
        addstatDots()
        addStatistics()
        
    }
    
    
    func addBackButton(){
        //Button to return to home screen.
        let backButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        backButton.frame = CGRectMake(self.view.frame.width/2, self.view.frame.height - 40, self.view.frame.width - 100, 40)
        //backButton.center = self.view.center
        backButton.setTitle("Back", forState: UIControlState.Normal)
        backButton.setTitleColor(UIColor.whiteColor(), forState: UIControlState.Normal)
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
    
    func addstatDots() {
        
        let dotBack1 = UIView(frame: CGRectMake(self.view.frame.width/8 - 15, 3*self.view.frame.height/6 + 5, 30, 30))
        let dotBack2 = UIView(frame: CGRectMake(self.view.frame.width/8 - 15, 2*self.view.frame.height/3 - 15, 30, 30))
        let dotBack3 = UIView(frame: CGRectMake(self.view.frame.width/8 - 15, 5*self.view.frame.height/6 - 35, 30, 30))
        dotBack1.backgroundColor = UIColor(netHex: cs_blue)
        dotBack2.backgroundColor = UIColor(netHex: cs_blue)
        dotBack3.backgroundColor = UIColor(netHex: cs_blue)
        dotBack1.layer.cornerRadius = 16
        dotBack2.layer.cornerRadius = 16
        dotBack3.layer.cornerRadius = 16
        
        self.view.addSubview(dotBack1)
        self.view.addSubview(dotBack2)
        self.view.addSubview(dotBack3)
        
        let dot1 = UIView(frame: CGRectMake(self.view.frame.width/8 - 10, 1*self.view.frame.height/2 + 10, 20, 20))
        let dot2 = UIView(frame: CGRectMake(self.view.frame.width/8 - 10, 2*self.view.frame.height/3 - 10, 20, 20))
        let dot3 = UIView(frame: CGRectMake(self.view.frame.width/8 - 10, 5*self.view.frame.height/6 - 30, 20, 20))
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
    
    func addStatistics() {
        let blurb1 = UILabel(frame: CGRectMake(self.view.frame.width/8 + 30, 3*self.view.frame.height/6 + 10, 300, 20))
        let blurb2 = UILabel(frame: CGRectMake(self.view.frame.width/8 + 30, 2*self.view.frame.height/3 - 10, 300, 20))
        let blurb3 = UILabel(frame: CGRectMake(self.view.frame.width/8 + 30, 5*self.view.frame.height/6 - 30, 300, 20))
        let blurb4 = UILabel(frame: CGRectMake(self.view.frame.width/8 + 30, 5*self.view.frame.height/6 - 10, 300, 20))
        let blurb5 = UILabel(frame: CGRectMake(self.view.frame.width/8 + 30, 5*self.view.frame.height/6 + 10, 300, 20))
        blurb1.textColor = UIColor.whiteColor()
        blurb2.textColor = UIColor.whiteColor()
        blurb3.textColor = UIColor.whiteColor()
        blurb4.textColor = UIColor.whiteColor()
        blurb5.textColor = UIColor.whiteColor()
        blurb1.font = UIFont(name: "helvetica neue", size: 15)
        blurb2.font = UIFont(name: "helvetica neue", size: 15)
        blurb3.font = UIFont(name: "helvetica neue", size: 15)
        blurb4.font = UIFont(name: "helvetica neue", size: 15)
        blurb5.font = UIFont(name: "helvetica neue", size: 15)

        blurb1.text = "# times engaged in front line"
        blurb2.text = "# times assisted passively"
        blurb3.text = "# times sacrificed self"
        blurb4.text = "# people trapped"
        blurb5.text = "# people saved"
        
        self.view.addSubview(blurb1)
        self.view.addSubview(blurb2)
        self.view.addSubview(blurb3)
        self.view.addSubview(blurb4)
        self.view.addSubview(blurb5)
        
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

