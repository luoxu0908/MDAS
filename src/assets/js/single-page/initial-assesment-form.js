  Foundation.Abide.defaults.patterns['NRIC'] = /^[A-Z]{1}[0-9]{7}[A-Z]{1}$/;
  Foundation.Abide.defaults.patterns['Mobile'] = /^\+{0,1}\d{8,}$/;
  $(document).foundation();
    var SectionCObj = {};
  $(function () {
      //get cookie & loginID
      var appCookie = Cookies.getJSON('appCookie'),
          loginID = appCookie.loginID;

      $('.scoreRow :input[type="checkbox"]').click(function () {
          if ($(this).is(':checked')) {

              if ($('#sectionE_totalScore').val().length <= 0) {
                  $('#sectionE_totalScore').val(parseInt($(this).val()));
              } else {
                  $('#sectionE_totalScore').val(parseInt($('#sectionE_totalScore').val()) + parseInt($(this).val()));
              }

          } else {
              $('#sectionE_totalScore').val(parseInt($('#sectionE_totalScore').val()) - parseInt($(this).val()));

          }

      })
      // save data
      $('#submit').click(function () {
          SaveInitialAssesment();
      });
      $.when(formSectionsInit(), formOthersInit(), GetRelationship('.sectionB_relationship'), GetRelationship('.sectionC_relationship'),GetReviewedBy(),GetDeclaration()).then(function () {
          var ID = '';
          ID = GetQueryString('ID');
          if (ID.length > 0) {
              GetInitialAssesmentForm(ID)
          }
      });
      $('#sectionA_race').change(function () {
            if ($(this).val().indexOf('Others') >= 0) {
                $('#sectionA_RaceOthersDiv').show();
            }
            else {
                $('#sectionA_RaceOthersDiv').hide();
            }
      });
      $('#sectionA_ordinaryMembership').click(function(){
          if ($('#sectionA_ordinaryMembership').is(':checked') && $('#sectionA_GroupID').val().length>0) {
              GetMemberShip($('#sectionA_GroupID').val());
          }
      });
      $('#sectionA_GroupID').blur(function(){
          if ($('#sectionA_ordinaryMembership').is(':checked') && $('#sectionA_GroupID').val().length>0) {
              GetMemberShip($('#sectionA_GroupID').val());
          }
      });
      $('#sectionC_SameASsectionB').click(function(){
        if ($(this).is(':checked')) {
            SectionCSameAsSsectionB($(this).val());
        }else{
          SectionCSameAsSsectionB('0');
        }
      });
      var CurrentDate=new Date();
      $('#sectionD_Date').val(convertDateTime(CurrentDate,'date'));
      $('#sectionE_Date').val(convertDateTime(CurrentDate,'date'));
      $('#sectionF_Date').val(convertDateTime(CurrentDate,'date'));

      $('#sectionA_PostalCode').blur(function () {
			if ($(this).val() !== '') {
		        GetAddress();
			}
		});


  });

  function GetAddress() {
       var data = { 'Country': 'Singapore', 'PostalCode': $('#sectionA_PostalCode').val() };
       $.ajax({
           url: apiSrc + "BCMain/iCtc1.GetAddressByPostalCode.json",
           method: "POST",
           dataType: "json",
           xhrFields: { withCredentials: true },
           data: {
               'data': JSON.stringify(data),
               'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
               'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
           },
           success: function (data) {
               if ((data) && (data.d.RetVal === -1)) {
                   if (data.d.RetData.Tbl.Rows.length > 0) {
                       var ResultA = data.d.RetData.Tbl.Rows[0];
                       $('#sectionA_HouseBlock').val(ResultA.AddrP1);
                       $('#sectionA_Unit').val(ResultA.AddrP2);
                       $('#sectionA_StreetName').val(ResultA.AddrP3);
                       $('#sectionA_BuildingName').val(ResultA.AddrP4);

                   }
               }
           }
       });

   }
function GetReviewedBy(){
  $('#sectionD_ReviewedBy,#sectionE_ReviewedBy,#sectionF_Reviewed').html('<option value="">-- Please Select --</option>');
  var data = { '': '' }
        $.ajax({
            url: apiSrc + "BCMain/iCtc1.GetReviewedBy.json",
            method: "POST",
            dataType: "json",
            xhrFields: { withCredentials: true },
            data: {
                'data': JSON.stringify(data),
                'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
                'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
            },
            success: function (data) {
                if ((data) && (data.d.RetVal === -1)) {
                    if (data.d.RetData.Tbl.Rows.length > 0) {
                        var Result = data.d.RetData.Tbl.Rows;
                        for (var i = 0; i < Result.length; i++) {
                            $('#sectionD_ReviewedBy,#sectionE_ReviewedBy,#sectionF_Reviewed').append('<option value="' + Result[i].RoleID + '">' + Result[i].DisplayName + '</option>');
                        }
                    }
                }
                else {
                    alert(data.d.RetMsg);
                }
            }
        });
}
function GetMemberShip(GroupID){
  var data = { 'GroupID': GroupID };
      $.ajax({
          url: apiSrc + "BCMain/iCtc1.GetMemberShipByGroupID.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify(data),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {

                  if (data.d.RetData.Tbls[0].Rows.length>0) {
                     var ResultA = data.d.RetData.Tbls[0].Rows[0];
                       $('#sectionA_FamilyName').val(ResultA.A_FamilyName || '')
                       $('#sectionA_GivenName').val(ResultA.A_GivenName || '')
                       $('#sectionA_DisplayName').val(ResultA.A_DisplayName || '')
                       $('#sectionA_nric').val(ResultA.A_EntityKey || '')
                       $('#sectionA_dateOfBirth').val(ResultA.A_BirthDate || '')

                       if (ResultA.A_Gender == 'F') {
                           $('#sectionA_genderFemale').prop('checked', true)
                       } else if (ResultA.A_Gender == 'M') {
                           $('#sectionA_genderMale').prop('checked', true)
                       } else {

                       }
                       var SectionARace = ResultA.A_Race || '';
                       if (SectionARace.length > 0) {
                           $('#sectionA_race').val(SectionARace)
                           var sectionA_race = $('#sectionA_race').val() || '';
                           if (sectionA_race.length <= 0) {
                               $('#sectionA_RaceOthersDiv').show();
                               $('#sectionA_race').val('Others')
                               $('#sectionA_raceOthersText').val(SectionARace)
                           }
                       }
                       var sectionA_language = ResultA.A_Language || '';
                       if (sectionA_language.length > 0) {

                           var sectionA_languageArr = sectionA_language.split(',');
                           var Otherlanguage = '';

                           for (var i = 0; i < sectionA_languageArr.length; i++) {
                               if (sectionA_languageArr[i].length > 0) {
                                   var flag = false;
                                   $('input[name="sectionA_language"]').each(function () {
                                       if ($(this).val() == sectionA_languageArr[i]) { $(this).prop('checked', true); flag = true; }
                                   });
                                   if (flag == false) {
                                       Otherlanguage += sectionA_languageArr[i] + ' ';
                                   }
                               }

                           }
                           if (Otherlanguage.length > 0) {
                               $('#sectionA_languageOthersText').val(Otherlanguage);
                               $('input[name="sectionA_language"]').each(function () {
                                   if ($(this).val() == 'Others') { $(this).prop('checked', true); }
                               });
                           }
                       }

                       var sectionA_education = ResultA.A_Education || '';
                       if (sectionA_education.length > 0) {

                           var OtherEducation = '';
                           var flag = false;
                           $('input[name="sectionA_education"]').each(function () {
                               if ($(this).val() == sectionA_education) { $(this).prop('checked', true); flag = true; }
                           });
                           if (flag == false) {
                               OtherEducation += sectionA_education;
                           }
                           if (OtherEducation.length > 0) {
                               $('#sectionA_educationOthersText').val(OtherEducation);
                               $('#sectionA_educationOthers').prop('checked', true)
                           }
                       }
                       $('#sectionA_mobile').val(ResultA.A_Mobile || '')
                       $('#sectionA_home').val(ResultA.A_Home || '')
                       $('#sectionA_office').val(ResultA.A_Office || '')
                       $('#sectionA_email').val(ResultA.A_Email || '')

                       $('#sectionA_HouseBlock').val(ResultA.A_Block || '')
                       $('#sectionA_Unit').val(ResultA.A_Unit || '')
                       $('#sectionA_StreetName').val(ResultA.A_StreetName || '')
                       $('#sectionA_StreetName').val(ResultA.A_BuildingName || '')
                       $('#sectionA_PostalCode').val(ResultA.A_PostalCode || '')

                       var ResultB = data.d.RetData.Tbls[1].Rows[0];
                        if (data.d.RetData.Tbls[1].Rows.length>0) {
                          $('#sectionB_FamilyName').val(ResultB.B_FamilyName || '')
                          $('#sectionB_GivenName').val(ResultB.B_GivenName || '')
                          $('#sectionB_DisplayName').val(ResultB.B_DisplayName || '')
                          $('#sectionB_nric').val(ResultB.B_EntityKey || '')
                          $('#sectionB_dateOfBirth').val(ResultB.B_BirthDate || '')
                          $('#sectionB_relationship').val(ResultB.B_Relationship || '')
                          $('#sectionB_mobile').val(ResultB.B_Mobile || '')
                          $('#sectionB_home').val(ResultB.B_Home || '')
                          $('#sectionB_office').val(ResultB.B_Office || '')
                          $('#sectionB_email').val(ResultB.B_Email || '')
                        }


                       if (data.d.RetData.Tbls[2].Rows.length>0) {
                         var ResultC = data.d.RetData.Tbls[2].Rows[0];
                         $('#sectionC_FamilyNameMain').val(ResultC.C_FamilyName || '');
                         $('#sectionC_GivenNameMain').val(ResultC.C_GivenName || '');
                         $('#sectionC_DisplayNameMain').val(ResultC.C_DisplayName || '');
                         $('#sectionC_nric').val(ResultC.C_EntityKey || '');
                         $('#sectionC_dateOfBirth').val(ResultC.C_BirthDate || '');
                         $('#sectionC_relationship').val(ResultC.C_Relationship || '');
                         $('#sectionC_mobile').val(ResultC.C_Mobile || '');
                         $('#sectionC_home').val(ResultC.C_Home || '');
                         $('#sectionC_office').val(ResultC.C_Office || '');
                         $('#sectionC_email').val(ResultC.C_Email || '');
                       }

                  }
              }
          }
      });

}
  //get url param
  function GetQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      var context = "";
      if (r != null)
          context = r[2];
      reg = null;
      r = null;
      return context == null || context == "" || context == "undefined" ? "" : context;
  }
  //get data
  function GetInitialAssesmentForm(ID) {
      var data = { 'ID': ID };
      $.ajax({
          url: apiSrc + "BCMain/iCtc1.GetInitialAssesmentForm.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify(data),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      var InitialAssesment = data.d.RetData.Tbl.Rows[0];
                      var SectionAMDASMembership=InitialAssesment.SectionAMDASMembership||'';
                      if (SectionAMDASMembership == true) {
                          $('#sectionA_ordinaryMembership').prop('checked', true)
                      } else if (SectionAMDASMembership == false) {
                          $('#sectionA_ordinaryMembership').prop('checked', false)
                      }
                      $('#sectionA_FamilyName').val(InitialAssesment.SectionAFamilyName || '')
                      $('#sectionA_GivenName').val(InitialAssesment.SectionAGivenName || '')
                      $('#sectionA_DisplayName').val(InitialAssesment.SectionADisplayName || '')
                      $('#sectionA_nric').val(InitialAssesment.SectionANRIC || '')
                      $('#sectionA_dateOfBirth').val(InitialAssesment.SectionABirth || '')

                       if (InitialAssesment.SectionAGender == 'F') {
                           $('#sectionA_genderFemale').prop('checked', true)
                       } else if (InitialAssesment.SectionAGender == 'M') {
                           $('#sectionA_genderMale').prop('checked', true)
                       } else {

                       }
                       var SectionARace = InitialAssesment.SectionARace || '';
                       if (SectionARace.length > 0) {
                          $('#sectionA_race').val(SectionARace)
                          var sectionA_race=$('#sectionA_race').val()||'';
                          if (sectionA_race.length <=0) {
                            $('#sectionA_RaceOthersDiv').show();
                            $('#sectionA_race').val('Others')
                            $('#sectionA_raceOthersText').val(SectionARace)
                          }
                      }
                       var sectionA_language = InitialAssesment.SectionALanguageSpoken || '';
                       if (sectionA_language.length > 0) {

                           var sectionA_languageArr = sectionA_language.split(',');
                           var Otherlanguage = '';

                           for (var i = 0; i < sectionA_languageArr.length; i++) {
                               if (sectionA_languageArr[i].length > 0) {
                                   var flag = false;
                                   $('input[name="sectionA_language"]').each(function () {
                                       if ($(this).val() == sectionA_languageArr[i]) { $(this).prop('checked', true); flag = true; }
                                   });
                                   if (flag == false) {
                                       Otherlanguage += sectionA_languageArr[i] + ' ';
                                   }
                               }

                           }
                           if (Otherlanguage.length > 0) {
                               $('#sectionA_languageOthersText').val(Otherlanguage);
                               $('input[name="sectionA_language"]').each(function () {
                                   if ($(this).val() == 'Others') { $(this).prop('checked', true); }
                               });
                           }
                       }

                       var sectionA_education = InitialAssesment.SectionAHighestEducation || '';
                       if (sectionA_education.length > 0) {

                           var OtherEducation = '';
                           var flag = false;
                           $('input[name="sectionA_education"]').each(function () {
                               if ($(this).val() == sectionA_education) { $(this).prop('checked', true); flag = true; }
                           });
                           if (flag == false) {
                               OtherEducation += sectionA_education;
                           }
                           if (OtherEducation.length > 0) {
                               $('#sectionA_educationOthersText').val(OtherEducation);
                              $('#sectionA_educationOthers').prop('checked', true)
                           }
                       }
                       $('#sectionA_mobile').val(InitialAssesment.SectionAHandphone || '')
                       $('#sectionA_home').val(InitialAssesment.SectionATelNoHome || '')
                       $('#sectionA_office').val(InitialAssesment.SectionATelNoOffice || '')
                       $('#sectionA_email').val(InitialAssesment.SectionAEmail || '')

                       $('#sectionB_FamilyName').val(InitialAssesment.SectionBFamilyName || '')
                       $('#sectionB_GivenName').val(InitialAssesment.SectionBGivenName || '')
                       $('#sectionB_DisplayName').val(InitialAssesment.SectionBDisplayName || '')
                       $('#sectionB_nric').val(InitialAssesment.SectionBNRIC || '')
                       $('#sectionB_dateOfBirth').val(InitialAssesment.SectionBBirth || '')
                       $('#sectionB_relationship').val(InitialAssesment.SectionBRelationship || '')
                       $('#sectionB_mobile').val(InitialAssesment.SectionBHandphone || '')
                       $('#sectionB_home').val(InitialAssesment.SectionBTelNoHome || '')
                       $('#sectionB_office').val(InitialAssesment.SectionBTelNoOffice || '')
                       $('#sectionB_email').val(InitialAssesment.SectionBEmail || '')
                       SectionCObj.SectionCFamilyName=InitialAssesment.SectionCFamilyName||'';
                       SectionCObj.SectionCGivenName=InitialAssesment.SectionCGivenName||'';
                       SectionCObj.SectionCDisplayName=InitialAssesment.SectionCDisplayName||'';
                       SectionCObj.SectionCNRIC=InitialAssesment.SectionCNRIC||'';
                       SectionCObj.SectionCBirth=InitialAssesment.SectionCBirth||'';
                       SectionCObj.SectionCRelationship=InitialAssesment.SectionCRelationship||'';
                       SectionCObj.SectionCHandphone=InitialAssesment.SectionCHandphone||'';
                       SectionCObj.SectionCTelNoHome=InitialAssesment.SectionCTelNoHome||'';
                       SectionCObj.SectionCTelNoOffice=InitialAssesment.SectionCTelNoOffice||'';
                       SectionCObj.SectionCEmail=InitialAssesment.SectionCEmail||'';
                       $('#sectionC_FamilyNameMain').val(InitialAssesment.SectionCFamilyName || '')
                       $('#sectionC_GivenNameMain').val(InitialAssesment.SectionCGivenName || '')
                       $('#sectionC_DisplayNameMain').val(InitialAssesment.SectionCDisplayName || '')
                       $('#sectionC_nric').val(InitialAssesment.SectionCNRIC || '')
                       $('#sectionC_dateOfBirth').val(InitialAssesment.SectionCBirth || '')
                       $('#sectionC_relationship').val(InitialAssesment.SectionCRelationship || '')
                       $('#sectionC_mobile').val(InitialAssesment.SectionCHandphone || '')
                       $('#sectionC_home').val(InitialAssesment.SectionCTelNoHome || '')
                       $('#sectionC_office').val(InitialAssesment.SectionCTelNoOffice || '')
                       $('#sectionC_email').val(InitialAssesment.SectionCEmail || '')


                       $('#sectionD_PrimaryDiagnosis').val(InitialAssesment.SectionDPrimaryDiagnosis || '')
                       $('#sectionD_SecondaryDiagnosis').val(InitialAssesment.SectionDSecondaryDiagnosis || '')

                       var sectionD_Precautions = InitialAssesment.SectionDPrecautions || '';
                       if (sectionA_language.length > 0) {

                           var sectionD_PrecautionsArr = sectionA_language.split(',');
                           var OtherPrecautions = '';

                           for (var i = 0; i < sectionA_languageArr.length; i++) {
                               if (sectionD_PrecautionsArr[i].length > 0) {
                                   var flag = false;
                                   $('input[name="sectionD_Precautions"]').each(function () {
                                       if ($(this).val() == sectionD_PrecautionsArr[i]) { $(this).prop('checked', true); flag = true; }
                                   });
                                   if (flag == false) {
                                       OtherPrecautions += sectionD_PrecautionsArr[i] + ' ';
                                   }
                               }

                           }
                           if (OtherPrecautions.length > 0) {
                               $('#sectionD_PrecautionsOthersText').val(OtherPrecautions);
                               $('input[name="sectionD_Precautions"]').each(function () {
                                   if ($(this).val() == 'Others') { $(this).prop('checked', true); }
                               });
                           }
                       }
                       $('#sectionD_Medications').val(InitialAssesment.SectionDMedications || '')
                       var sectionD_HomeAlone= InitialAssesment.SectionDsectionDHomeAlone||'';
                       if (sectionD_HomeAlone == 'Alone') {
                           $('#sectionD_HomeAlone').prop('checked', true)
                       } else if (sectionD_HomeAlone == 'WithFamily') {
                           $('#sectionD_HomeWithFamily').prop('checked', true)
                       } else {

                       }
                       $('#sectionD_HomeMainCaregiver').val(InitialAssesment.SectionDHomeMainCaregiver || '')
                       var sectionD_HomeLift= InitialAssesment.SectionDHomeLift||'';
                       if (sectionD_HomeLift == 'Yes') {
                           $('#sectionD_HomeLiftYes').prop('checked', true)
                       } else if (sectionD_HomeLift == 'No') {
                           $('#sectionD_HomeLiftNo').prop('checked', true)
                       } else {

                       }

                       $('#sectionD_MainEntrance').val(InitialAssesment.SectionDMainEntrance || '')
                       $('#sectionD_HeightStep').val(InitialAssesment.SectionDHeightStep || '')
                       $('#sectionD_HomeMainCaregiver').val(InitialAssesment.SectionCNRIC || '')
                       var sectionD_HomeRamp= InitialAssesment.SectionDHomeRamp||'';
                       if (sectionD_HomeRamp == 'Portable ramp') {
                           $('#sectionD_HomeRampPortable').prop('checked', true)
                       } else if (sectionD_HomeRamp == 'Built-up ramp') {
                           $('#sectionD_HomeRampBuilt').prop('checked', true)
                       } else if(sectionD_HomeRamp == 'None'){
                         $('#sectionD_HomeRamp').prop('checked', true)
                       }

                       var sectionD_ToiletKerb= InitialAssesment.SectionDToiletKerb||'';
                       if (sectionD_ToiletKerb == 'Yes') {
                           $('#sectionD_ToiletKerbYes').prop('checked', true)
                       } else if (sectionD_ToiletKerb == 'No') {
                           $('#sectionD_ToiletKerbNo').prop('checked', true)
                       } else {

                       }
                       var sectionD_NoGrab= InitialAssesment.SectionDToiletNoGrab||'';
                       if (sectionD_NoGrab == 'Yes') {
                           $('#sectionD_NoGrabYes').prop('checked', true)
                       } else if (sectionD_NoGrab == 'No') {
                           $('#sectionD_NoGrabNo').prop('checked', true)
                       } else {

                       }

                       var sectionD_ToiletAntiSlip= InitialAssesment.SectionDToiletAntiSlip||'';
                       if (sectionD_ToiletAntiSlip == 'Yes') {
                           $('#sectionD_ToiletAntiSlipYes').prop('checked', true)
                       } else if (sectionD_NoGrab == 'No') {
                           $('#sectionD_ToiletAntiSlipNo').prop('checked', true)
                       } else {

                       }
                       var sectionD_ToiletType= InitialAssesment.SectionDToiletType||'';
                       if (sectionD_ToiletType == 'Yes') {
                           $('#sectionD_ToiletTypeYes').prop('checked', true)
                       } else if (sectionD_NoGrab == 'No') {
                           $('#sectionD_ToiletTypeNo').prop('checked', true)
                       } else {

                       }
                       var sectionD_ToiletAnticipated= InitialAssesment.SectionDToiletAnticipated||'';
                       if (sectionD_ToiletAnticipated == 'Yes') {
                           $('#sectionD_ToiletAnticipatedYes').prop('checked', true)
                       } else if (sectionD_NoGrab == 'No') {
                           $('#sectionD_ToiletAnticipatedNo').prop('checked', true)
                       } else {

                       }

                       var sectionD_SensoryVision= InitialAssesment.SectionDSensoryVision||'';
                       if (sectionD_SensoryVision == 'Normal') {
                           $('#sectionD_SensoryVisionNormal').prop('checked', true)
                       } else if (sectionD_SensoryVision == 'Wears glasses/contact lenses') {
                           $('#sectionD_SensoryVisionWears').prop('checked', true)
                       } else if (sectionD_SensoryVision == 'Low/No vision*') {
                           $('#sectionD_SensoryVisionLow').prop('checked', true)
                       }else {

                       }
                       var sectionD_SensoryAuditory= InitialAssesment.SectionDSensoryAuditory||'';
                       if (sectionD_SensoryAuditory == 'Normal') {
                           $('#sectionD_SensoryAuditoryNormal').prop('checked', true)
                       } else if (sectionD_SensoryAuditory == 'Impaired (Left/Right/Both)*') {
                           $('#sectionD_SensoryAuditoryImpaired').prop('checked', true)
                       } else if (sectionD_SensoryAuditory == 'No hearing') {
                           $('#sectionD_SensoryAuditoryHearing').prop('checked', true)
                       }else {

                       }
                       var sectionD_SensorySpeech= InitialAssesment.SectionDSensorySpeech||'';
                       if (sectionD_SensorySpeech == 'Normal') {
                           $('#sectionD_SensorySpeechNormal').prop('checked', true)
                       } else if (sectionD_SensorySpeech == 'Slurred/Unclear speech*') {
                           $('#sectionD_SensorySpeechWears').prop('checked', true)
                       } else if (sectionD_SensorySpeech == 'No speech') {
                           $('#sectionD_SensorySpeechVision').prop('checked', true)
                       }else {

                       }
                       var sectionD_Feeding= InitialAssesment.SectionDFeeding||'';
                       if (sectionD_Feeding == 'Soft') {
                           $('#sectionD_FeedingSoft').prop('checked', true)
                       } else if (sectionD_Feeding == 'Blended') {
                           $('#sectionD_FeedingBlended').prop('checked', true)
                       } else if (sectionD_Feeding == 'Bite-sized') {
                           $('#sectionD_FeedingBite').prop('checked', true)
                       }else if (sectionD_Feeding == 'Normal') {
                           $('#sectionD_FeedingNormal').prop('checked', true)
                       }else {

                       }
                       $('#sectionD_Remarks').val(InitialAssesment.SectionDRemarks || '')
                       $('#sectionD_ReviewedBy').val(InitialAssesment.SectionDReviewedBy || '')
                       $('#sectionD_Date').val(InitialAssesment.SectionDDate || '')

                       var SectionEIndoors=InitialAssesment.SectionEMoibilityIndoors || '';
                       var SectionEIndoorsseArr = SectionEIndoors.split(',');
                       for (var i = 0; i < SectionEIndoorsseArr.length; i++) {
                           if (SectionEIndoorsseArr[i].length > 0) {
                               $('input[name="sectionE_moibilityIndoors"]').each(function () {
                                   if ($(this).val() == SectionEIndoorsseArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }
                       var sectionE_Transfers=InitialAssesment.SectionETransfers || '';
                       var sectionE_TransfersleArr = sectionE_Transfers.split(',');
                       for (var i = 0; i < sectionE_TransfersleArr.length; i++) {
                           if (sectionE_TransfersleArr[i].length > 0) {

                               $('input[name="sectionE_Transfers"]').each(function () {
                                   if ($(this).val() == sectionE_TransfersleArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var sectionE_Stairs=InitialAssesment.SectionEStairs || '';
                       var sectionE_StairsArr = sectionE_Stairs.split(',');
                       for (var i = 0; i < sectionE_StairsArr.length; i++) {
                           if (sectionE_StairsArr[i].length > 0) {
                               $('input[name="sectionE_Stairs"]').each(function () {
                                   if ($(this).val() == sectionE_StairsArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }
                       var SectionEToiletUse=InitialAssesment.SectionEToiletUse || '';
                       var SectionEToiletUseArr = SectionEToiletUse.split(',');
                       for (var i = 0; i < SectionEToiletUseArr.length; i++) {
                           if (SectionEToiletUseArr[i].length > 0) {
                               $('input[name="sectionE_ToiletUse"]').each(function () {
                                   if ($(this).val() == SectionEToiletUseArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var SectionEBladder=InitialAssesment.SectionEBladder || '';
                       var SectionEBladderArr = SectionEBladder.split(',');
                       for (var i = 0; i < SectionEBladderArr.length; i++) {
                           if (SectionEBladderArr[i].length > 0) {
                               $('input[name="sectionE_Bladder"]').each(function () {
                                   if ($(this).val() == SectionEBladderArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var SectionEBowels=InitialAssesment.SectionEBowels || '';
                       var SectionEBowelsArr = SectionEBowels.split(',');
                       for (var i = 0; i < SectionEBowelsArr.length; i++) {
                           if (SectionEBowelsArr[i].length > 0) {
                               $('input[name="sectionE_Bowels"]').each(function () {
                                   if ($(this).val() == SectionEBowelsArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var SectionEBathingShowering=InitialAssesment.SectionEBathingShowering || '';
                       var SectionEBathingShoweringArr = SectionEBathingShowering.split(',');
                       for (var i = 0; i < SectionEBathingShoweringArr.length; i++) {
                           if (SectionEBathingShoweringArr[i].length > 0) {
                               $('input[name="sectionE_BathingShowering"]').each(function () {
                                   if ($(this).val() == SectionEBathingShoweringArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var SectionEGrooming=InitialAssesment.SectionEGrooming || '';
                       var SectionEGroomingArr = SectionEGrooming.split(',');
                       for (var i = 0; i < SectionEGroomingArr.length; i++) {
                           if (SectionEGroomingArr[i].length > 0) {
                               $('input[name="sectionE_Grooming"]').each(function () {
                                   if ($(this).val() == SectionEGroomingArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var SectionEDressing=InitialAssesment.SectionEDressing || '';
                       var SectionEDressingArr = SectionEDressing.split(',');
                       for (var i = 0; i < SectionEDressingArr.length; i++) {
                           if (SectionEDressingArr[i].length > 0) {
                               var flag = false;
                               $('input[name="sectionE_Dressing"]').each(function () {
                                   if ($(this).val() == SectionEDressingArr[i]) { $(this).prop('checked', true); }
                               });

                           }

                       }

                       var SectionEFeeding=InitialAssesment.SectionEFeeding || '';
                       var SectionEFeedingArr = SectionEFeeding.split(',');
                       for (var i = 0; i < SectionEFeedingArr.length; i++) {
                           if (SectionEFeedingArr[i].length > 0) {
                               var flag = false;
                               $('input[name="sectionE_Feeding"]').each(function () {
                                   if ($(this).val() == SectionEFeedingArr[i]) { $(this).prop('checked', true); }
                               });
                           }
                       }
                      $('#sectionE_totalScore').val(InitialAssesment.SectionETotalScore || '')

                      var SectionEPhysicalAssistance=InitialAssesment.SectionEPhysicalAssistance || '';
                      var SectionEPhysicalAssistanceArr = SectionEPhysicalAssistance.split(',');
                      for (var i = 0; i < SectionEPhysicalAssistanceArr.length; i++) {
                          if (SectionEPhysicalAssistanceArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionE_Physical"]').each(function () {
                                  if ($(this).val() == SectionEPhysicalAssistanceArr[i]) { $(this).prop('checked', true); }
                              });

                          }

                      }
                      var SectionEPersonalHygiene=InitialAssesment.SectionEPersonalHygiene || '';
                      var SectionEPersonalHygieneArr = SectionEPersonalHygiene.split(',');
                      for (var i = 0; i < SectionEPersonalHygieneArr.length; i++) {
                          if (SectionEPersonalHygieneArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionE_Personal"]').each(function () {
                                  if ($(this).val() == SectionEPersonalHygieneArr[i]) { $(this).prop('checked', true); }
                              });

                          }

                      }
                      var SectionENursingCare=InitialAssesment.SectionENursingCare || '';
                      var SectionENursingCareArr = SectionENursingCare.split(',');
                      for (var i = 0; i < SectionENursingCareArr.length; i++) {
                          if (SectionENursingCareArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionE_Nursing"]').each(function () {
                                  if ($(this).val() == SectionENursingCareArr[i]) { $(this).prop('checked', true); }
                              });

                          }

                      }

                      var SectionEAssistiveDevicesUsed = InitialAssesment.SectionEAssistiveDevicesUsed || '';
                      if (SectionEAssistiveDevicesUsed.length > 0) {

                          var SectionEAssistiveDevicesUsedArr = SectionEAssistiveDevicesUsed.split(',');
                          var OtherSectionEAssistiveDevicesUsed = '';
                          for (var i = 0; i < SectionEAssistiveDevicesUsedArr.length; i++) {
                              if (SectionEAssistiveDevicesUsedArr[i].length > 0) {
                                  var flag = false;
                                  $('input[name="sectionE_Assistive"]').each(function () {
                                      if ($(this).val() == SectionEAssistiveDevicesUsedArr[i]) { $(this).prop('checked', true); flag = true; }
                                  });
                                  if (flag == false) {
                                      OtherSectionEAssistiveDevicesUsed += SectionEAssistiveDevicesUsedArr[i] + ' ';
                                  }
                              }

                          }
                          if (OtherSectionEAssistiveDevicesUsed.length > 0) {
                              $('#sectionE_AssistiveOthersText').val(OtherSectionEAssistiveDevicesUsed);
                              $('input[name="sectionE_Assistive"]').each(function () {
                                  if ($(this).val() == 'Others') { $(this).prop('checked', true); }
                              });
                          }
                      }
                      var SectionEAnticipatedDevices= InitialAssesment.SectionEAnticipatedDevices||'';
                      if (SectionEAnticipatedDevices == 'Yes') {
                          $('#sectionE_DevicesYes').prop('checked', true)
                      } else if (SectionEAnticipatedDevices == 'No') {
                          $('#sectionE_DevicesNo').prop('checked', true)
                      } else {

                      }
                      $('#sectionE_Remarks').val(InitialAssesment.SectionERemarks || '')
                      $('#sectionE_ReviewedBy').val(InitialAssesment.SectionEReviewedBy || '')
                      $('#sectionE_Date').val(InitialAssesment.SectionEDate || '')

                      $('#sectionF_periodFrom').val(InitialAssesment.SectionFPeriodFrom || '')
                      $('#sectionF_periodTo').val(InitialAssesment.SectionFPeriodTo || '')
                      var sectionF_period=InitialAssesment.SectionFPeriod || '';
                      var sectionF_periodArr = sectionF_period.split(',');
                      for (var i = 0; i < sectionF_periodArr.length; i++) {
                          if (sectionF_periodArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionF_period"]').each(function () {
                                  if ($(this).val() == sectionF_periodArr[i]) { $(this).prop('checked', true); }
                              });
                          }
                      }
                      $('#sectionF_TimingText').val(InitialAssesment.SectionFTiming || '')
                      var sectionF_Timing=InitialAssesment.SectionFTiming || '';
                      var sectionF_TimingArr = sectionF_Timing.split(',');
                      for (var i = 0; i < sectionF_TimingArr.length; i++) {
                          if (sectionF_TimingArr[i].length > 0) {
                              var flag = false;
                              $('input[name="sectionF_Timing"]').each(function () {
                                  if ($(this).val() == sectionF_TimingArr[i]) { $(this).prop('checked', true); }
                              });
                          }
                      }
                      $('#sectionF_remarks').val(InitialAssesment.SectionFRemarks || '')
                      $('#sectionF_Reviewed').val(InitialAssesment.SectionFReviewedBy || '')
                      $('#sectionF_Date').val(InitialAssesment.SectionFDate || '')

                      var SectionGSubsidy= InitialAssesment.SectionGSubsidy||'';
                      if (SectionGSubsidy == 'Yes') {
                          $('#sectionG_SubsidyYes').prop('checked', true)
                      } else if (SectionGSubsidy == 'No') {
                          $('#sectionG_SubsidyNo').prop('checked', true)
                      } else {

                      }
                      var SectionGAgencies= InitialAssesment.SectionGAgencies||'';
                      if (SectionGAgencies.length>0) {
                        if (SectionGAgencies == 'No') {
                            $('#sectionG_AgenciesNo').prop('checked', true)
                        }else {
                          $('#sectionG_AgenciesYes').prop('checked', true)
                          $('#sectionG_SourceFunding').val(SectionGAgencies)
                        }

                      }
                      $('#sectionG_Official').val(InitialAssesment.SectionGOfficial || '')
                  }
              }
          }
      });
  }
  // save initial-assesment-form
  function SaveInitialAssesment() {
      var data = {};
      $('#pageContentWrapper :input,select').each(function () {
          var type = $(this).attr('type'), name = $(this).attr('name'), val = $(this).val();
          if (type == "radio") { val = $(':input[type="' + type + '"][name="' + name + '"]:checked').val() || ''; };
          if (type == "checkbox") {
              var tempVal = '';
              $(':input[type="' + type + '"][name="' + name + '"]').each(function (index, item) {
                  if ($(item).prop('checked') == true) {
                      tempVal += $(item).val() + ',';
                  }
              });
              val = (tempVal.length > 0 ? tempVal.substr(0, tempVal.length - 1) : '');
          };
          if ((!data.hasOwnProperty(data[name])) && name) {
              data[name] = val;
          }
      });

      $.ajax({
          url: apiSrc + "BCMain/iCtc1.SaveInitialAssesment.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify(data),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      if (data.d.RetData.Tbl.Rows[0].Success == true) {
                          alert('Successfully updated!');
                      } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
                  }
              }
              else {
                  alert(data.d.RetMsg);
              }
          },
          error: function (XMLHttpRequest, data, errorThrown) {
              alert("Error: " + errorThrown);
          }
      })
  }

  function GetRelationship(sel) {
      $.ajax({
          url: apiSrc + "BCMain/iCtc1.SearchRelationshipType.json",
          method: "POST",
          dataType: "json",
          xhrFields: {
              withCredentials: true
          },
          data: {
              'data': JSON.stringify({}),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      var lookup = data.d.RetData.Tbl.Rows;
                      for (var i = 0; i < lookup.length; i++) {
                          $(sel).append('<option value="' + lookup[i].RelationshipAB + '">' + lookup[i].RelationshipAB + '</option>');
                      }
                  }
              } else {
                  alert(data.d.RetMsg);
              }
          }
      });
  }
  function formOthersInit() {
      $('[data-form-other-text=true]').prop('readonly', 'readonly');
      $('[data-form-other]').each(function () {
          var thisObj = $(this);
          var targetVal = thisObj.data('form-other');
          var targetObj = $('#' + targetVal);
          var target = $('#' + targetVal);


          if (thisObj.prop('type') == 'checkbox') {
              //console.log('checkbox');
              thisObj.click(function () {
                  if (thisObj.is(':checked')) {
                      targetObj.prop('readonly', '');
                  }
                  else {
                      targetObj.val('');
                      targetObj.prop('readonly', 'readonly');
                  }
              });
          }
          else if (thisObj.prop('type') == 'radio') {
              var radioName = thisObj.prop('name');
              var thisVal = thisObj.val();
              var radioGroup = $('[name=' + radioName + ']');

              radioGroup.click(function () {

                  if ($('[name=' + radioName + ']:checked').val() == thisVal) {
                      targetObj.prop('readonly', '');
                  }
                  else {
                      targetObj.val('');
                      targetObj.prop('readonly', 'readonly');
                  }
              });
          }
          else if (thisObj.is('select')) {
              thisObj.change(function () {
                  var thisVal = thisObj.val();
                  //console.log('select');
                  if (thisVal.toLowerCase() == 'other' || thisVal.toLowerCase() == 'others') {
                      targetObj.prop('readonly', '');
                  }
                  else {
                      targetObj.val('');
                      targetObj.prop('readonly', 'readonly');
                  }
              });
          }
      });
  }

  //convert date to dd/mm/yyyy
  function convertDateTime(inputFormat, type) {
      if (inputFormat == null) {
          return '-';
      };
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      if (type == 'date') {
          return [d.getFullYear() ,pad(d.getMonth() + 1), pad(d.getDate())].join('-');
      } else if (type == 'datetime') {
          return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('-') + ' ' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
      } else if (type == 'time') {
          return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
      }
  };

  //geneare drop down optioms
  function GetDropdownList(id, category) {
      var data = { 'LookupCat': category }
      $.ajax({
          url: apiSrc + "BCMain/iCtc1.Lookup_Get.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify(data),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      var lookup = data.d.RetData.Tbl.Rows;
                      for (var i = 0; i < lookup.length; i++) {
                          $(id).append('<option value="' + lookup[i].LookupKey + '">' + lookup[i].Description + '</option>');
                      }
                  }
              }
              else {
                  alert(data.d.RetMsg);
              }
          }
      });
  };
  function formSectionsInit() {
      $('form.formSection').each(function () {
          var form = $(this);
          var fieldsets = form.find('fieldset');
          var breadcrumbs = form.find('.breadcrumbs');
          var footer = form.find('footer.buttonsGroup');

          form.data('current-form-index', 0);

          breadcrumbs.html('');

          fieldsets.each(function (index) {

              var fieldset = $(this);
              fieldset.data('fieldset-index', index);
              breadcrumbs.append('<li><a href="#' + fieldset.prop('id') + '" data-fieldset-index="' + index + '">' + fieldset.find('h2').html() + '</a>').find('li:eq(0) a').addClass('active');

              if (index > 0) {
                  fieldset.hide();
              }
          });

          breadcrumbs.find('a').click(function () {
              var thisObj = $(this);
              var currentIndex = parseInt(form.data('current-form-index'));
              if (formSectionValidate(form, 0)) {
                  loadFormSection(thisObj.data('fieldset-index'));
              }
              return false;
          });

          //set buttons
          footer.find('#previous').hide();
          footer.find('[class*=submit]').hide();

          footer.find('#previous').click(function () {
              var currentIndex = parseInt(form.data('current-form-index'));
              var targetIndex = currentIndex - 1;

              if (targetIndex < 0) targetIndex = 0;

              if (formSectionValidate(form, 0)) {
                  loadFormSection(targetIndex);
              }
              return false;
          });
          footer.find('#next').click(function () {
              if (formSectionValidate(form, 0)) {
                  var targetIndex = parseInt(form.data('current-form-index')) + 1;
                  if (targetIndex >= fieldsets.length) targetIndex = fieldsets.length - 1;
                  loadFormSection(targetIndex);
              }
              return false;
          });
          function loadFormSection(index) {
              //set index
              form.data('current-form-index', index);
              var targetIndex = index;

              breadcrumbs.find('a').removeClass('active').filter(function () {
                  return ($(this).data('fieldset-index') == targetIndex);
              }).addClass('active');

              //set fieldset`
              fieldsets.hide().filter(function () {
                  return ($(this).data('fieldset-index') == targetIndex);
              }).show();

              if (index == 0) {
                  footer.find('#previous').hide();
                  footer.find('#next').show();
                  footer.find('[class*=submit]').hide();
              }
              else if (index == fieldsets.length - 1) {
                  footer.find('#previous').show();
                  footer.find('#next').hide();
                  footer.find('[class*=submit]').show();
              }
              else {
                  footer.find('#previous').show();
                  footer.find('#next').show();
                  footer.find('[class*=submit]').hide();
              }
          }
      });
  }

  function formSectionValidate(form, isAll) {
      var result = 0;
      if (!isAll) {
          $(form).find('fieldset:hidden :input,select').attr('disabled', 'disabled');
      }
      $(form).on('formvalid.zf.abide', function () { result = 1; });
      $(form).foundation('validateForm');
      $(form).find('fieldset :input').removeAttr('disabled');
      return result;
  }

  function SectionCSameAsSsectionB(IsChecked){
    if (IsChecked=='1') {
      $('#sectionC_FamilyNameMain').val($('#sectionB_FamilyName').val())
      $('#sectionC_GivenNameMain').val($('#sectionB_GivenName').val())
      $('#sectionC_DisplayNameMain').val($('#sectionB_DisplayName').val())
      $('#sectionC_nric').val($('#sectionB_nric').val())
      $('#sectionC_relationship').val($('#sectionB_relationship').val())
      $('#sectionC_dateOfBirth').val($('#sectionB_dateOfBirth').val());
      $('#sectionC_mobile').val($('#sectionB_mobile').val())
      $('#sectionC_home').val($('#sectionB_home').val())
      $('#sectionC_office').val($('#sectionB_office').val())
      $('#sectionC_email').val($('#sectionB_email').val())
    }else{
      $('#sectionC_FamilyNameMain').val(SectionCObj.SectionCFamilyName);
      $('#sectionC_GivenNameMain').val(SectionCObj.SectionCGivenName);
      $('#sectionC_DisplayNameMain').val(SectionCObj.SectionCDisplayName);
      $('#sectionC_nric').val(SectionCObj.SectionCNRIC);
      $('#sectionC_dateOfBirth').val(SectionCObj.SectionCBirth);
      $('#sectionC_relationship').val(SectionCObj.SectionCRelationship);
      $('#sectionC_mobile').val(SectionCObj.SectionCHandphone);
      $('#sectionC_home').val(SectionCObj.SectionCTelNoHome);
      $('#sectionC_office').val(SectionCObj.SectionCTelNoOffice);
      $('#sectionC_email').val(SectionCObj.SectionCEmail);
    }

  }

  function GetDeclaration(){
        return $.JSONPost('iCtc1.Lookup_Get.json', { 'LookupCat': 'Declaration' }).done(function (data) {
            var R = data.d.RetData.Tbl.Rows, RowCnt = R.length;
            var html = '';
            for (var i = 0; i < RowCnt; i++) {
                html += ' <label for="' + R[i].LookupKey + '" class="inlineblock"><input  type="checkbox"  name="Declaration" value="' + R[i].LookupKey + '" id="' + R[i].LookupKey + '" required/> &nbsp;' + R[i].Description + '</label>';
            }
            $("#DeclarationList").html(html);
        });
    }
