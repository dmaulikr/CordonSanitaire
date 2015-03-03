//
//  Lobby.swift
//  Cordon Sanitaire
//
//  Created by Lara Timbó on 3/2/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import Foundation


class Lobby {
    class var singleton: Lobby! {
        return _SingletonSharedInstance
    }
    
    var players: [String] = [];
    var countdown_timer = NSTimer();
    
    func addPlayer(player: String){
        self.players.append(player)
        NSLog("Player \(player) was added to the lobby")
    }
    
    func addPlayers(newPlayers: [String]){
        self.players.extend(newPlayers)
    }
    
    func emptyLobby(){
        self.players = []
    }
    

}

private let _SingletonSharedInstance = Lobby()
