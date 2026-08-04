from build_skill_index import main as build_skill_index
from train_disaster_risk import main as train_disaster
from train_scam_classifier import main as train_scam

if __name__ == "__main__":
    train_scam()
    train_disaster()
    build_skill_index()
