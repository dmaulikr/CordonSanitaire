//
//  LobbyViewCell.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/18/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit

class LobbyViewCell: UITableViewCell {
    
    var cellProfileImage = UIImageView()
    var cellProfileBacking = UIImageView()
    var cellName = UILabel()
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: .Default, reuseIdentifier: "cell" )
        cellProfileImage.backgroundColor = UIColor.whiteColor()
        cellProfileBacking.backgroundColor = UIColor(netHex: cs_blue)
        cellName.backgroundColor = UIColor.clearColor()
        cellName.textAlignment = NSTextAlignment.Left
        self.contentView.addSubview(cellName)
        self.contentView.addSubview(cellProfileBacking)
        self.contentView.addSubview(cellProfileImage)
        
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        cellProfileImage.frame = CGRectMake(14, 7.5, self.bounds.height-14.5, self.bounds.height-14.5)
        cellProfileImage.layer.cornerRadius = (self.bounds.height-14.5)/2
        cellProfileImage.clipsToBounds = true
        cellProfileBacking.frame = CGRectMake(12, 5.5, self.bounds.height-10.5, self.bounds.height-10.5)
        cellProfileBacking.layer.cornerRadius = (self.bounds.height-10.5)/2
        cellName.frame = CGRectMake(self.bounds.height + 10, 0, self.bounds.width - 2*self.bounds.height - 10, self.bounds.height)
        
    }
    
    override func setSelected(selected: Bool, animated: Bool){
        super.setSelected(selected, animated:animated)
    }
    
    required init(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    
}


