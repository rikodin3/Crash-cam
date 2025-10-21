import torch
import torch.nn as nn

#putting the model in a .py file to import it to the server file

class CNN_LSTM(nn.Module):
    def __init__(self, num_classes=2, hidden_dim=128, num_layers=1):
        super(CNN_LSTM, self).__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1),  # input 3x224x224
            nn.ReLU(),
            nn.MaxPool2d(2),  # 16x112x112

            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),  # 32x56x56

            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),  # 64x28x28
        )

        self.feature_dim = 64 * 28 * 28  # each frame turned into a vector of 64*128*128 size
        # lstm with hidden_dim = 128, consisting of 60 feature vectors
        self.lstm = nn.LSTM(input_size=self.feature_dim,
                            hidden_size=hidden_dim,
                            num_layers=num_layers,
                            batch_first=True)
        # fully-connected layer for classification (it maps it to logits)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        """
        x: [B, T, C, H, W]
        """
        B, T, C, H, W = x.size()

        # Merge batch and time for CNN
        x = x.view(B*T, C, H, W)  # [B*T, 3, H, W] combining batch and sequence dimension to treat each frame individually
        features = self.cnn(x)
        features = features.view(B, T, -1)  # flatten to [B, T, feature_dim] for lstm

        lstm_out, _ = self.lstm(features)  # [B, T, hidden_dim] # take the last hidden state only

        # Use last time step for classification
        last_out = lstm_out[:, -1, :]  # [B, hidden_dim]

        out = self.fc(last_out)  # [B, num_classes]
        return out
