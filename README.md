# 🛡️ QR Code Security Management System

![Main](/screenshot/Main.png)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

</div>

## 📋 프로젝트 개요

**큐싱 예방을 위한 B2B 보안 관리 시스템 개발**

본 프로젝트는 **QR 피싱(큐싱) 범죄를 사전에 예방**하기 위해 QR코드의 변조를 자동 감지하고, 외부 보안 API 연동을 통한 URL 안전성 검증을 수행하는 통합 보안 시스템입니다.

### 🎯 핵심 목표

- QR코드 변조 자동 감지 시스템 구축
- 외부 보안 API 연동을 통한 URL 안전성 검증
- 기업 및 일반 사용자 대상 실시간 보안 위협 대응 지원
- 디지털 보안 강화 및 사이버 범죄 예방

## ✨ 배경 및 주요 기능

<br/>

![LifeCycle](/screenshot/LifeCycle.png)

### <b> 등록 → 배포 → 점검 → 대응 </b>

- **QR코드 등록 관리**: 기업에서 사용하는 QR코드 사전 등록 및 DB 관리
- **QR코드 스캔**: 모바일 최적화된 QR 스캐너를 통한 실시간 보안 검증
- **변조 탐지**: 실제 스캔된 QR코드와 등록된 원본 간 비교를 통한 자동 변조 감지
- **메타데이터 관리**: QR코드 설명, 위치 등 상세 정보 관리
- **실시간 모니터링**: 이력 데이터 기반 모니터링 및 알림 기능
- **대시보드**: 종합 보안 현황 및 맞춤형 보안 리포트 제공
- **URL 보안 검사**: 외부 보안 API(URLhaus, VirusTotal) 연계 다각도 보안 분석
- **위협 탐지**: 피싱, 악성코드, 개인정보 유출 등 다양한 보안 위협 요소 분석

<br/>

| 기존 문제점                       | 해결 방안                       |
| --------------------------------- | ------------------------------- |
| ❌ 체계적인 등록/관리 시스템 부재 | ✅ 선제적 QR 코드 보안 관리     |
| ❌ 변조 여부 확인 방법 없음       | ✅ 실시간 변조 탐지 시스템      |
| ❌ 점검 주기 관리 어려움          | ✅ 주기적 점검 스케줄링         |
| ❌ 위협 발생 시 즉각적 대응 불가  | ✅ 다중 보안 API 연동 위협 분석 |

## 대시보드

![Dashboard](/screenshot/00.png)
대시보드에서 모든 QR 코드를 상태별로 필터링하고 점검 이력과 세부정보를 한눈에 확인할 수 있습니다. <br/>
QR 코드 상태 (안전 or 변조), 설명, 위치, 원본 URL, 점검 URL, 마지막 점검일자, 경과일

## QR 코드 등록

![Registration](/screenshot/01.webp)

관리하고자 하는 QR 코드를 직접 스캔하여 URL을 자동 인식하고 설명과 설치 위치를 입력하여 등록합니다. QR코드는 미점검 상태로 입력한 정보와 함께 등록됩니다.

## QR 코드 점검

![Registration](/screenshot/02.webp)

현장에서 QR 코드를 스캔하여 원본과 비교 검증합니다. 점검 스캔과 동시에 변조 여부를 판단하여 스캔 URL, 점검일자, 경과일이 등록됩니다.
변조된 QR 코드는 즉시 감지되어 빨간색으로 표시되어 위험을 알립니다.

## URL 위협 분석

![Registration](/screenshot/03.webp)
또한 스캔된 URL은 외부 보안 API인
URLHaus와 VirusTotal과 연동하여 실시간 위협 분석 정보를 제공합니다.

## 🏗️ 기술 스택

### Frontend : **Next.js** + **React**

### Backend : **Node.js** + **Oracle Database**

### **External APIs**: URLhaus, VirusTotal 보안 API 연동

## 📁 프로젝트 구조

![process](/screenshot/Process.png)

```
qshing_pj/
├── pages/
│   ├── api/                    # API 라우트
│   │   ├── qr/                # QR 관련 API
│   │   ├── check-url.js       # URL 보안 검사
│   │   └── check-virustotal.js # VirusTotal API
│   ├── qr/                    # QR 관련 페이지
│   ├── CheckURL/              # URL 검사 페이지
│   └── dashboard/             # 대시보드
├── components/                # 재사용 가능한 컴포넌트
│   ├── QRScanner/            # QR 스캐너 컴포넌트
│   └── LoadingSpinner.js     # 로딩 인디케이터
├── lib/                      # 유틸리티 라이브러리
│   ├── oracle.js            # Oracle DB 연결
│   └── scanner.js           # QR 스캐닝 로직
├── styles/                   # CSS 스타일시트
└── scripts/                 # 데이터베이스 스크립트
```

## 🎯 적용 분야 및 확장 가능성

### 주요 적용 대상

- **대기업 보안팀**: 엔터프라이즈급 보안 관리
- **공공기관**: 시설 관리 및 공공 서비스 보안
- **대형 상업시설**: 고객 안전 및 브랜드 보호
- **교육기관**: 캠퍼스 보안 및 학생 안전
- **의료기관**: 환자 정보 보호 및 의료 서비스 보안
- **관광시설**: 방문객 안전 및 서비스 품질 향상

## 💡 기대 효과

### 보안 강화

- 큐싱 공격 예방으로 인한 보안 사고 방지
- 브랜드 신뢰도 및 고객 안전 확보

### 운영 효율성

- 체계적인 QR 코드 관리로 업무 효율 향상
- 자동화된 점검 시스템으로 인건비 절약

### 컴플라이언스

- 기업 보안 정책 준수
- 보안 감사 대응 용이성

## 📚 API

![API](/screenshot/API.png)

## 📚 DB

![DB](/screenshot/DB.png)
