//
//  GameKitHelper.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/21/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit
import GameKit

private let _SingletonSharedInstance = GameKitHelper()

class GameKitHelper: NSObject {

    class var singleton: GameKitHelper! {
        return _SingletonSharedInstance
    }
    
    var enableGameCenter: Bool!
    
    override init(){
        super.init()
        // code for game kit helper
        enableGameCenter = true
    }
    
    func authenticateLocalPlayer() {
        
        var localPlayer = GKLocalPlayer.localPlayer()
        
        // look at local player information
        println(localPlayer.debugDescription)
        
        localPlayer.authenticateHandler = {(viewController : UIViewController!, error : NSError!) -> Void in
            if ((viewController) != nil) {
//                self.presentViewController(viewController, animated: true, completion: nil)
                
            } else{
                println((GKLocalPlayer.localPlayer().authenticated))
                
            }
        }
    }
    
}