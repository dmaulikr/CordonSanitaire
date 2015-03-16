//
//  ViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 2/18/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // code goes here
        
        // set background color
        self.view.backgroundColor = UIColor.blackColor()
        
        // add buttons
        let playButton   = UIButton.buttonWithType(UIButtonType.System) as UIButton
        
        playButton.frame = CGRectMake(0, 0, 300, 50)
        playButton.center = self.view.center
        playButton.setTitle("PLAY", forState: UIControlState.Normal)
        playButton.titleLabel?.textColor = UIColor.whiteColor()
        playButton.titleLabel?.font = UIFont(name: "helvetica neue", size: 48.0)
        playButton.addTarget(self, action: "onButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(playButton)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func onButtonPress(sender:UIButton!) {
        println("button pressed")
        
        // display the map view
        let mapViewController:MapViewController = MapViewController()
        self.presentViewController(mapViewController, animated: true, completion: nil)
    }
}




