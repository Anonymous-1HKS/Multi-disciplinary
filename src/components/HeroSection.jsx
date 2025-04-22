import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';
import videoBg from '/Volumes/Programming/Javascript/my-app/src/components/Img&vid/video-1.mp4'; // Đường dẫn video hợp lệ

function HeroSection() {
  const navigate = useNavigate(); // Hook để điều hướng

  return (
    <div className="hero-container">
      <video className="video-bg" src={videoBg} autoPlay loop muted />
      <h1>ADVENTURE AWAITS</h1>
      <p>What are you waiting for?</p>
      <div className="hero-btns">
        <Button 
          className="btns" 
          buttonStyle="btn--outline" 
          buttonSize="btn--large" 
          onClick={() => navigate('/login')} // Điều hướng đến trang đăng nhập
        >
          GET STARTED
        </Button>
        <Button 
          className="btns" 
          buttonStyle="btn--primary" 
          buttonSize="btn--large" 
          onClick={() => console.log('Watching Trailer...')}
        >
          WATCH TRAILER <i className="far fa-play-circle" />
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;
