open UniverseJs;;
open Color;;
open Image;;
open World;;
open TransformToInt;;

(*  卒業研究 stage1 飛行機を座標にしたがって置いてみよう！ *)
(*  世界の構造体の定義 *)
type world_t = {
  airplane : int * int;
  sun : int * int;
  lop : (int * int) list;
};;

(*  大きさの定義 *)
let width = 1200;;
let height = 600;;
let upper = 550;;
let lower = 0;;

(*  画像の定義 *)
let airplane = read_image "../airplane.png" 142 64;;
let sun = read_image "../sun.png" 90 90;;
let sky = read_image "../sky.png" width height;;

(*  y軸を逆にする関数 *)
let mainasu_y (x, y) =
  (x, height - y);;
let place_image2 image (x, y) scene =
  place_image image (mainasu_y (x, y)) scene;;
let place_images2 image_list zahyou_list scene =
  place_images image_list (List.map mainasu_y zahyou_list) scene;;

(*  座標付きの雲を作る関数 *)
let make_contrails (x, y) =
  overlay (text ("(" ^ string_of_int x ^ ", " ^ string_of_int y ^ ")") 8 (make_color 150 200 200 ~alpha:255)) (0, 0) (circle 10 Color.white);;

(*  空のシーン *)
let empty_background = empty_scene width height;;

(*  背景（メモリの縦横線と空の画像） *)
let background_scene = place_images2 [line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (0, 600)] (make_color 0 0 0 ~alpha:100)] [(0, height / 2); (100, height / 2); (200, height / 2); (300, height / 2); (400, height / 2); (500, height / 2); (600, height / 2); (700, height / 2); (800, height / 2); (900, height / 2); (1000, height / 2); (1100, height / 2); (1200, height / 2)] (place_images2 [line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100); line [(0, 0); (1200, 0)] (make_color 0 0 0 ~alpha:100)] [(width / 2, 0); (width / 2, 100); (width / 2, 200); (width / 2, 300); (width / 2, 400); (width / 2, 500); (width / 2, 600)] (place_image2 sky (width / 2, height / 2) empty_background));;

(*  飛行機と太陽の座標とメモリ線の表示 *)
let zahyou_hyouji {airplane = (airplane_x, airplane_y); sun = (sun_x, sun_y); lop = lop} =
  place_image2 (text ("(" ^ string_of_int airplane_x ^ ", " ^ string_of_int airplane_y ^ ")") 12 (make_color 0 0 0 ~alpha:150)) (airplane_x, airplane_y + 35) (place_image2 (text ("(" ^ string_of_int (sun_x mod width) ^ ", " ^ string_of_int sun_y ^ ")") 12 (make_color 0 0 0 ~alpha:150)) (sun_x mod width, sun_y + 55) (place_image2 (line [(0, 0); (0, 1200)] (make_color 0 0 0 ~alpha:150)) (airplane_x, airplane_y) (place_image2 (line [(0, 0); (2400, 0)] (make_color 0 0 0 ~alpha:150)) (airplane_x, airplane_y) background_scene)));;

(*  draw関数（飛行機と太陽と雲と座標表示） *)
let draw {airplane = (airplane_x, airplane_y); sun = (sun_x, sun_y); lop = lop} =
  place_image2 airplane (airplane_x, airplane_y) (place_image2 sun (sun_x mod width, sun_y mod height) (place_images2 (List.map make_contrails lop) lop (place_image2 (circle 5 Color.red) (200, 100) (place_image2 (circle 5 Color.red) (400, 400) (place_image2 (circle 5 Color.red) (700, 500) (place_image2 (circle 5 Color.red) (1000, 300) (place_image2 (text "A" 12 Color.red) (190, 110) (place_image2 (text "B" 12 Color.red) (390, 410) (place_image2 (text "C" 12 Color.red) (690, 510) (place_image2 (text "D" 12 Color.red) (990, 310) (zahyou_hyouji {airplane = (airplane_x, airplane_y); sun = (sun_x, sun_y); lop = lop})))))))))));;

(*  初期値の設定 *)
let initial_lop = [];;
