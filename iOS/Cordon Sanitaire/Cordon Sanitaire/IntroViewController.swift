
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
        container = UIView(frame: CGRectMake(0, 0, self.view.frame.width, self.view.frame.height * 5))
        scrollView.addSubview(container)
        
        //set the scroll content size to the container
        scrollView.contentSize = container.frame.size
        
        //button 
        addBackButton()
        
        
        //add scene 1 - Britain
        let scene1 = UIView(frame: self.view.frame)
        scene1.backgroundColor = UIColor.yellowColor()
        container.addSubview(scene1)
        
        //Britain Text --- PARALLAX DEMOING
        //UIMotionEffect()
        //scrolling speed adjustments
        
        let label: UILabel = UILabel()
        label.frame = CGRectMake(0, 0, 300, 300)
        label.textAlignment = NSTextAlignment.Center
        label.text = "Britain, Eyam"
        label.font = UIFont (name: "Cutive-Regular", size: 30)
        container.addSubview(label)
        
        
        //add scene 2 - Australia
        let scene2 = UIView(frame: self.view.frame)
        scene2.frame.origin = CGPointMake(0, self.view.frame.height)
        scene2.backgroundColor = UIColor.blueColor()
        container.addSubview(scene2)
        
        //Australia background
        let brit = UIImage(named: "australia.png")
        let view = UIImageView(image:brit)
        view.frame = CGRectMake(0, self.view.frame.height, self.view.frame.width, self.view.frame.height)
        container.addSubview(view)
        
        //Australia Images
        //viewbar
        let view2 = UIImageView()
        view2.frame = CGRectMake(self.view.frame.width - 90, self.view.frame.height, 8, 667)
        view2.backgroundColor = UIColor(red: 32.0/255, green: 48.0/255, blue: 63.0/255, alpha: 01.0)
        container.addSubview(view2)
        
        //Australia Text
        //Location
        let title2: UILabel = UILabel()
        title2.frame = CGRectMake(0, self.view.frame.height, 300, 50) //x, y, width, height
        title2.textAlignment = NSTextAlignment.Right
        title2.text = "Australia, Kirribilli"
        title2.font = UIFont(name: "Cutive-Regular", size: 20)
        container.addSubview(title2)
        //year
        let yr2: UILabel = UILabel()
        yr2.frame = CGRectMake(0, self.view.frame.height + 50, 300, 150)
        yr2.textAlignment = NSTextAlignment.Right
        yr2.text = "1884"
        yr2.font = UIFont(name: "Cutive-Regular", size: 35)
        container.addSubview(yr2)
        //disease
        let d2: UILabel = UILabel()
        d2.frame = CGRectMake(0, self.view.frame.height + 110, 300, 150)
        d2.textAlignment = NSTextAlignment.Right
        d2.text = "typhoid fever"
        d2.font = UIFont(name: "Cutive-Regular", size: 20)
        container.addSubview(d2)
        //p0
        let p02: UILabel = UILabel()
        p02.frame = CGRectMake(0, self.view.frame.height + 125, 300, 150)
        p02.textAlignment = NSTextAlignment.Right
        p02.text = "patient zero: unknown"
        p02.font = UIFont(name: "Cutive-Regular", size: 10)
        container.addSubview(p02)
        //coordinates
        let c2: UILabel = UILabel()
        c2.frame = CGRectMake(0, self.view.frame.height + 150, 300, 150)
        c2.textAlignment = NSTextAlignment.Right
        c2.text = "33.8504° S, 151.2148° E"
        c2.font = UIFont(name: "Cutive-Regular", size: 10)
        container.addSubview(c2)
        //population
        let p2: UILabel = UILabel()
        p2.frame = CGRectMake(0, self.view.frame.height + 170, 300, 150)
        p2.textAlignment = NSTextAlignment.Right
        p2.text = "population  215"
        p2.font = UIFont(name: "Cutive-Regular", size: 20)
        container.addSubview(p2)
        //death toll
        let dt2: UILabel = UILabel()
        dt2.frame = CGRectMake(0, self.view.frame.height + 190, 300, 150)
        dt2.textAlignment = NSTextAlignment.Right
        dt2.text = "death toll  51"
        dt2.font = UIFont(name: "Cutive-Regular", size: 20)
        container.addSubview(dt2)
        
        
        //flavor text
        let line1 : UILabel = UILabel()
        let line2 : UILabel = UILabel()
        let line3 : UILabel = UILabel()
        let line4 : UILabel = UILabel()
        line1.textAlignment = NSTextAlignment.Right; line2.textAlignment = NSTextAlignment.Right
        line3.textAlignment = NSTextAlignment.Right; line4.textAlignment = NSTextAlignment.Right
        line1.font = UIFont(name:"Cutive-Regular", size: 20); line2.font = UIFont(name:"Cutive-Regular", size: 20)
        line3.font = UIFont(name:"Cutive-Regular", size: 20); line4.font = UIFont(name:"Cutive-Regular", size: 20)
        line1.frame = CGRectMake(0, self.view.frame.height+210, 200, 120); line2.frame = CGRectMake(0, self.view.frame.height+230, 200, 120)
        line3.frame = CGRectMake(0, self.view.frame.height+250, 200, 120); line4.frame = CGRectMake(0, self.view.frame.height+270, 200, 120)
        line1.text = "British"; line2.text = "convict ship"; line3.text = "quarantined"; line4.text = "on landing"
        container.addSubview(line1); container.addSubview(line2); container.addSubview(line3); container.addSubview(line4)


        
        //add scene 3 - New York
        let scene3 = UIView(frame: self.view.frame)
        scene3.frame.origin = CGPointMake(0, self.view.frame.height*2)
        scene3.backgroundColor = UIColor.orangeColor()
        container.addSubview(scene3)
        
        //add scene 4 - Moon
        let scene4 = UIView(frame: self.view.frame)
        scene4.frame.origin = CGPointMake(0, self.view.frame.height*3)
        scene4.backgroundColor = UIColor.brownColor()
        container.addSubview(scene4)
        
        //add scene 5 - Yugoslavia
        let scene5 = UIView(frame: self.view.frame)
        scene5.frame.origin = CGPointMake(0, self.view.frame.height*4)
        scene5.backgroundColor = UIColor.greenColor()
        container.addSubview(scene5)
        
        
        // Set up the minimum & maximum zoom scales
        scrollView.minimumZoomScale = 1.0
        scrollView.maximumZoomScale = 1.0
        scrollView.zoomScale = 1.0
        
    }
    
    func addBackButton(){
        let backButton = UIButton.buttonWithType(UIButtonType.System) as! UIButton
        backButton.frame = CGRectMake(0, 0, 200, 50)
        backButton.center = self.view.center
        backButton.setTitle("Go Back", forState: UIControlState.Normal)
        backButton.setTitleColor(UIColor.blackColor(), forState: UIControlState.Normal)
        //backButton.titleLabel?.font = UIFont(name: "Cutive-Regular", size: 30)
        backButton.addTarget(self, action: "backButtonPress:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view.addSubview(backButton)
    }
    
    func backButtonPress(sender: UIButton!){
        let rootViewController: UIViewController = ViewController()
        self.presentViewController(rootViewController, animated: true, completion: nil)
    }
    
    //grab root controller, hide Intro

    
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
