//
//  Utilities.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/6/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation

// Colors
let cs_red      = 0xEB624F
let cs_orange   = 0xEE9036
let cs_yellow   = 0xF7CC1D
let cs_green    = 0x03C6AA  //0x55ffb9
let cs_blue     = 0x405C72

// super handy for web colors
extension UIColor {
    convenience init(red: Int, green: Int, blue: Int) {
        assert(red >= 0 && red <= 255, "Invalid red component")
        assert(green >= 0 && green <= 255, "Invalid green component")
        assert(blue >= 0 && blue <= 255, "Invalid blue component")
        
        self.init(red: CGFloat(red) / 255.0, green: CGFloat(green) / 255.0, blue: CGFloat(blue) / 255.0, alpha: 1.0)
    }
    
    convenience init(netHex:Int) {
        self.init(red:(netHex >> 16) & 0xff, green:(netHex >> 8) & 0xff, blue:netHex & 0xff)
    }
}
