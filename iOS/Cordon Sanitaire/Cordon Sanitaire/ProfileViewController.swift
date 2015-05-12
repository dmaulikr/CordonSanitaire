//
//  ProfileViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit

protocol ProfileViewDelegate {
   func didFinishViewingProfile()
}

class ProfileViewController: UIViewController {
    
    var delegate:ProfileViewDelegate!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
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
