//
//  PlayerAnnotationView.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 4/8/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import MapKit

class PlayerAnnotationView: MKPinAnnotationView {

    var customMarker:CAShapeLayer
    
    override init(frame: CGRect) {
        //
        customMarker = CAShapeLayer()
        super.init(frame: frame)
        addCustomMarker()
    }
    
    override init!(annotation: MKAnnotation!, reuseIdentifier: String!) {
        //
        customMarker = CAShapeLayer()
        super.init(annotation: annotation, reuseIdentifier: reuseIdentifier)
        addCustomMarker()
    }

    required init(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func addCustomMarker() {
        //
        let radius:CGFloat = 10.0
        let center:CGPoint = CGPointMake(8, 34) // offset for pin size
        let startAngle = 0.0
        let endAngle = 2.0 * Double(M_PI)
        
        customMarker.lineWidth = 4.0
        customMarker.fillColor = UIColor(netHex: cs_red).CGColor
        customMarker.strokeColor = UIColor.whiteColor().CGColor
        customMarker.path = UIBezierPath(arcCenter: center, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(endAngle), clockwise: true).CGPath
        customMarker.shadowRadius = 4.0;
        customMarker.shadowColor = UIColor.blackColor().CGColor
        customMarker.shadowOpacity = 0.3
        customMarker.shadowOffset = CGSizeMake(0,0)
        self.layer.addSublayer(customMarker)

    }
    
    func setCustomMarkerColor(color:UIColor) {
        customMarker.removeFromSuperlayer()
        customMarker.fillColor = color.CGColor
        self.layer.addSublayer(customMarker)
    }
    
    
    func animateShout() {
        var shout = CAShapeLayer()
        
        let radius:CGFloat = 10.0
        let center:CGPoint = CGPointMake(8, 34) // offset for pin size
        let startAngle = 0.0
        let endAngle = 2.0 * Double(M_PI)
        
        shout.lineWidth = 4.0
        shout.fillColor = UIColor(netHex: cs_orange).CGColor
        shout.strokeColor = UIColor(netHex: cs_orange).CGColor
        shout.path = UIBezierPath(arcCenter: center, radius: radius, startAngle: CGFloat(startAngle), endAngle: CGFloat(endAngle), clockwise: true).CGPath
        self.layer.addSublayer(customMarker)
        
        // Create a blank animation using the keyPath "opacity", the property we want to animate
        let opacityAnimation = CABasicAnimation(keyPath: "opacity")
        
        // Define the parameters for the tween
        opacityAnimation.fromValue = 1.0
        opacityAnimation.toValue = 0.0
        opacityAnimation.duration = 1.5
        opacityAnimation.removedOnCompletion = true
        opacityAnimation.timingFunction = CAMediaTimingFunction(controlPoints: 0.25, 0, 0.75, 1)
        
        // Finally, add the animation to the layer
        shout.addAnimation(opacityAnimation, forKey: "opacity")
        
        // Create a blank animation using the keyPath "lineWidth", the property we want to animate
        let sizeAnimation = CABasicAnimation(keyPath: "lineWidth")
        
        // Define the parameters for the tween
        sizeAnimation.fromValue = 10.0
        sizeAnimation.toValue = 100.0
        sizeAnimation.duration = 1.5
        sizeAnimation.removedOnCompletion = true
        sizeAnimation.timingFunction = CAMediaTimingFunction(controlPoints: 0.25, 0, 0.75, 1)
        
        // Finally, add the animation to the layer
        shout.addAnimation(sizeAnimation, forKey: "lineWidth")

    }

    // Only override drawRect: if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
//    override func drawRect(rect: CGRect) {
//        // Drawing code
//        image = UIImage(contentsOfFile: "blank")
//        image.drawInRect(rect)
//    }
}
