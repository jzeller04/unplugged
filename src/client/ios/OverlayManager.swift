import UIKit
import ManagedSettingsUI

class OverlayManager: UIViewController {
    override func viewDidLoad {
        super.viewDidLoad()
        view.backgroundColor = .black
        addMessage()
    }

    private func addMessage() {
        let label = UILabel()
        label.text = "Take a breath/nLet Unplugged keep you focused"
        label.textColor = .white
        label.textAlignment = .center
        label.numberOfLines = 0

        view.addSubview(label)
        NSLayoutConstraint.activate ([
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            label.leadingAnchor.constraint(equalTo view.leadingAnchor, constant: 20),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
    }
}