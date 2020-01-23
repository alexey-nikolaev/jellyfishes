import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

class App extends Component {
  componentDidMount() {
    var animals = [];
    //var pivot = new THREE.Group();
    //pivot.position.set(0,0,0);

    var scene = new THREE.Scene();
    //scene.add(pivot);

    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    this.mount.appendChild( renderer.domElement );

    var controls = new OrbitControls( camera, renderer.domElement );
    camera.position.z = 100;
    controls.update();

    const ptLight1 = new THREE.PointLight(0x0058ab);
    ptLight1.position.set(100,0,250);
    scene.add(ptLight1);

    function onButtonClick(event) {
      var jelly = new JellyFish();
      jelly.add();
      animals.push(jelly);
    }

    var buttons = document.getElementsByTagName("button");
    buttons[0].addEventListener("click", onButtonClick, false);

    for(var i=0; i<3; i++){
      var jelly = new JellyFish();
      jelly.mesh.position.x = 0;
      jelly.mesh.position.y = 0;
      jelly.mesh.position.z = 0;
      jelly.add();
      animals.push(jelly);
    }

    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false );

    document.onmousemove = function(e){
      //uniforms.u_mouse.value.x = e.pageX
      //uniforms.u_mouse.value.y = e.pageY
    }

    function JellyFish() {
      var pos_x = Math.floor(100.0 * Math.random()) - 50;
      var pos_y = Math.floor(100.0 * Math.random()) - 50;
      var pos_z = Math.floor(100.0 * Math.random()) - 50;

      this.position = new THREE.Vector3(pos_x, pos_y, pos_z);
      this.size = Math.floor(10.0 * Math.random()) + 5;
      this.removed = false;
      this.rot_direction_y = Math.random() > 0.5 ? -1 : 1;
      this.angle_x = Math.random() * 2. * Math.PI;
      this.angle_y = Math.random() * 2. * Math.PI;

      this.rot_init = false;
      this.color_rot = Math.random();
      this.phase = Math.floor(Math.random()*10); 
      this.hue_adjust = Math.random() * Math.PI * 2.0;

      this.life = 100;

      JellyFish.prototype.build = function(size, position) {
        var geometry = new THREE.BoxGeometry( size, size, size/20.0, 20, 20, 1 );

        var uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib['lights'],
          { diffuse: { type: 'c', value: new THREE.Color(0xff00ff) } }
        ]);

        uniforms.u_time = { type: "f", value: 1.0 };
        uniforms.alpha = { type: "f", value: 0.8 };
        uniforms.color_rot = { type: "f", value: this.color_rot };
        uniforms.phase = { type: "f", value: this.phase };
        uniforms.hue_adjust = { type: "f", value: this.hue_adjust };

        var material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
            lights: true,
            transparent: true
        } );

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.set(position.x, position.y, position.z);

        return mesh;
      }

      this.mesh = this.build(this.size, this.position);

      JellyFish.prototype.advance = function() {
        this.mesh.material.uniforms.u_time.value += 0.05;
        this.mesh.translateZ(-0.1);
        this.position = this.mesh.position;
        this.life -= 0.001;
        if (this.life === 0) this.remove();
      }

      JellyFish.prototype.add = function() {
        scene.add(this.mesh);
      }

      JellyFish.prototype.remove = function() {
        scene.remove(this.mesh);
        this.removed = true;
      }

      JellyFish.prototype.rotate = function() {
        if(!this.rot_init) {
          this.mesh.rotation.x += this.angle_x;
          this.mesh.rotation.y += this.angle_y;
          this.rot_init = true;
        }
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += this.rot_direction_y * 0.01;
      }
    }

    function onWindowResize( event ) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
      //uniforms.u_resolution.value.x = renderer.domElement.width;
      //uniforms.u_resolution.value.y = renderer.domElement.height;
    }

    var animate = function () {
      requestAnimationFrame( animate );
      animals.forEach(
        element => {
          if (!element.removed) {
            element.rotate();
            element.advance();
          }
        }
      )

      controls.update();
      renderer.render( scene, camera );
    };

    animate();
  }
  render() {
    return (
      <div ref={ref => (this.mount = ref)} />
    )
  }
}

export default App;
