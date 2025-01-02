import {base_x, base_y, max_x, max_y} from './game.mjs';

class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(direction, speed) {
    const {x,y} = this;
    if(direction === 'Up'){
      this.y = Math.max(y - speed, base_y);
    }else if(direction === 'Down'){
      this.y = Math.min(y + speed, base_y + max_y);
    }else if(direction === 'Left'){
      this.x = Math.max(x - speed, base_x);
    }else if(direction === 'Right'){
      this.x = Math.min(x + speed, base_x + max_x);
    }else{
      return false;
    }
    const dir_moved = x != this.x || y != this.y;
    return dir_moved;
  }

  collision(item) {
    const dist = 12;
    const dx = this.x - item.x;
    const dy = this.y - item.y;
    const squared_dist = dx ** 2 + dy ** 2;
    const squared_collision_dist = dist ** 2;
    if(squared_dist < squared_collision_dist){
      return true;
    }else{
      return false;
    }
  }

  calculateRank(rank) {
    const scores = rank.sort((a, b) => b - a);
    return scores.indexOf(this.score) + 1;
  }
}

export default Player;
