
//
//  IntroViewController.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/13/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit

protocol IntroViewDelegate {
    func didFinishIntro();
}

class IntroViewController: UIViewController, UIScrollViewDelegate {

    var scrollView:UIScrollView!
    var container:UIView!
    
    var delegate: IntroViewDelegate!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        //add a scroller view
        scrollView = UIScrollView(frame: CGRectMake(0, 0, self.view.frame.width, self.view.frame.height))
        scrollView.scrollEnabled = true
        scrollView.showsVerticalScrollIndicator = false
        scrollView.delegate = self
        self.view.addSubview(scrollView)

        //add container
        container = UIView(frame: CGRectMake(0, 0, self.view.frame.width, self.view.frame.height * 3))
        scrollView.addSubview(container)
        
        //set the scroll content size to the container
        scrollView.contentSize = container.frame.size
        
        //add scene 1
        let scene1 = UIView(frame: self.view.frame)
        scene1.backgroundColor = UIColor.yellowColor()
        container.addSubview(scene1)
        
        //add scene 2
        let scene2 = UIView(frame: self.view.frame)
        scene2.frame.origin = CGPointMake(0, self.view.frame.height)
        scene2.backgroundColor = UIColor.blueColor()
        container.addSubview(scene2)
        
        //add scene 3
        let scene3 = UIView(frame: self.view.frame)
        scene3.frame.origin = CGPointMake(0, self.view.frame.height * 2)
        scene3.backgroundColor = UIColor.orangeColor()
        container.addSubview(scene3)
        
        // Set up the minimum & maximum zoom scales
        scrollView.minimumZoomScale = 1.0
        scrollView.maximumZoomScale = 1.0
        scrollView.zoomScale = 1.0
        
    }
    
    func show() {
        // animate in the components of this view
    }
    
    func hide() {
        // animate out the components of this view

        // tell the delegate to remove us from the view
        delegate.didFinishIntro()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func scrollViewDidScroll(scrollView: UIScrollView) {
        // do this on the scroll
        // update the timeline date...
        // gives a 1 to 1 sense of scale with time
        // this is a good way to prime the user for 1 to 1 scale in the game
    }
    
    func scrollViewWillEndDragging(scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>) {
        //land on a position that we want to land on based on the target content offset
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
