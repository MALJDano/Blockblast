<?php
class Game {
    private $grid;

    public function __construct() {
        $this->grid = array_fill(0, 10, array_fill(0, 10, 0));
    }

    public function getGrid() {
        return $this->grid;
    }
}
