# Google Cloud Speech to Text (STT) API
https://cloud.google.com/speech-to-text/docs/streaming-recognize?hl=ko


( https://webnautes.tistory.com/1247 -> 사이트의 큰 2번까지)

Step 1 . Google Cloud Speech to Text API 서비스 계정 키 발급 
         (아마도, push한 json 파일)

Step 2 . Cloud SDK 설치 

Step 3. test3.py 예제 
        -> VS code 에서 실행
        (단, 에러가 뜬다면
          pip install --upgrade google-cloud-texttosppech 
          pip install pyaudio
          pip install wheel
          pip install pipwin
          pipwin install pyaudio
          위의 코드를 다 실행해보길 바람) 
          그리고 터미널에서 python test3.py 
          그러면 실시간 스트리밍 입력에서 오디오를 텍스트로 변환이 됨!! -> 마이크 대고 해보세요들
